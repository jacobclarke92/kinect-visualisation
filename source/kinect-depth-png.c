#include <stdio.h>
#include "kinect.h"

void write_depth_png_netstring(FILE *file) {
  Buffer *buffer = Buffer_create();
  Image *image = Image_create(320, 240);

  Image_downsample(kinect_depth_image, image);

  if (Image_get_png(image, buffer)) {
    fprintf(file, "%lu:", buffer->size);
    Buffer_write(buffer, file);
    fputc(',', file);
  }

  Image_destroy(image);
  Buffer_destroy(buffer);
}

int main() {
  if (!kinect_initialize()) {
    return 1;
  }

  while (kinect_process_events()) {
    write_depth_png_netstring(stdout);
  }

  kinect_shutdown();
  return 0;
}
