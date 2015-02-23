#include <signal.h>
#include <stdio.h>
#include "image.h"
#include "kinect.h"

unsigned int kinect_last_depth_frame;
unsigned int kinect_running;

void kinect_handle_interrupt(int signal) {
  kinect_running = 0;
}

void kinect_trap_signals() {
  if (signal(SIGINT, kinect_handle_interrupt) == SIG_IGN) {
    signal(SIGINT, SIG_IGN);
  }

  if (signal(SIGTERM, kinect_handle_interrupt) == SIG_IGN) {
    signal(SIGTERM, SIG_IGN);
  }
}

void kinect_capture_depth_image(freenect_device *dev, void *v_depth, uint32_t timestamp) {
  int x, y;
  uint16_t *depth = (uint16_t*)v_depth;
  uint16_t value;
  kinect_depth_frame++;

  for (y = 0; y < 480; y++) {
    for (x = 0; x < 640; x++) {
      value = depth[y * 640 + x];
      Image_set_pixel(kinect_depth_image, x, y, 0xFF - (value >> 3));
    }
  }
}

int kinect_initialize() {
  if (kinect_initialized) {
    return 0;
  }

  kinect_running = 1;
  kinect_trap_signals();

  if (freenect_init(&kinect_context, NULL) < 0) {
    fprintf(stderr, "freenect_init() failed\n");
    return 0;
  }

  freenect_select_subdevices(kinect_context, (freenect_device_flags)(FREENECT_DEVICE_MOTOR | FREENECT_DEVICE_CAMERA));

  if (freenect_num_devices(kinect_context) < 1) {
    fprintf(stderr, "no devices found\n");
    freenect_shutdown(kinect_context);
    return 0;
  }

  if (freenect_open_device(kinect_context, &kinect_device, 0) < 0) {
    fprintf(stderr, "can't open device\n");
    freenect_shutdown(kinect_context);
    return 0;
  }

  kinect_depth_image = NULL;
  kinect_depth_frame = 0;
  kinect_last_depth_frame = 0;

  freenect_set_led(kinect_device, LED_GREEN);
  freenect_set_depth_callback(kinect_device, kinect_capture_depth_image);
  freenect_set_depth_mode(kinect_device, freenect_find_depth_mode(FREENECT_RESOLUTION_MEDIUM, FREENECT_DEPTH_11BIT));
  freenect_start_depth(kinect_device);

  kinect_initialized = 1;
  return 1;
}

int kinect_process_events() {
  if (!kinect_initialized) {
    return 0;
  }

  if (kinect_depth_image) {
    Image_destroy(kinect_depth_image);
  }

  kinect_depth_image = Image_create(640, 480);

  for (;;) {
    if (!kinect_running) {
      return 0;
    }

    int result = freenect_process_events(kinect_context);
    if (result < 0) {
      return result;
    }

    if (kinect_last_depth_frame != kinect_depth_frame) {
      kinect_last_depth_frame = kinect_depth_frame;
      return 1;
    }
  }

  return 0;
}

void kinect_shutdown() {
  if (!kinect_initialized) {
    return;
  }

  if (kinect_depth_image) {
    Image_destroy(kinect_depth_image);
  }

  freenect_stop_depth(kinect_device);
  freenect_set_led(kinect_device, LED_OFF);
  freenect_close_device(kinect_device);
  freenect_shutdown(kinect_context);
}
