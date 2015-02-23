#ifndef __KINECT_H__
#define __KINECT_H__

#include "image.h"
#include <libfreenect.h>

Image *kinect_depth_image;
unsigned int kinect_depth_frame;
static freenect_context *kinect_context;
static freenect_device *kinect_device;
static int kinect_initialized = 0;

int kinect_initialize();
int kinect_process_events();
void kinect_shutdown();

#endif
