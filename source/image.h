#ifndef __IMAGE_H__
#define __IMAGE_H__

#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include "buffer.h"

typedef uint8_t Pixel;

#define MAX_PIXEL (1 << sizeof(Pixel) * 8)

#define Pixel_get_red(p)   (uint8_t) p
#define Pixel_get_green(p) (uint8_t) p
#define Pixel_get_blue(p)  (uint8_t) p

struct Image_t {
  unsigned int width;
  unsigned int height;
  Pixel *data;
};

typedef struct Image_t Image;

Image *Image_create(unsigned int, unsigned int);

void Image_destroy(Image *);

extern inline void Image_set_pixel(Image *, unsigned int, unsigned int, Pixel);

extern inline Pixel Image_get_pixel(Image *, unsigned int, unsigned int);

char Image_write_png(Image *, FILE *);

char Image_get_png(Image *, Buffer *);

char Image_downsample(Image *, Image *);

void Image_invert(Image *);

void Image_equalize(Image *);

#endif
