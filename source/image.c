#include <png.h>
#include <math.h>
#include <stdio.h>
#include "image.h"

Image *Image_create(unsigned int width, unsigned int height) {
  Image *img = (Image *)malloc(sizeof(Image));
  if (!img) return 0;

  img->data = calloc(width * height * sizeof(Pixel), 1);
  if (!img->data) {
    free(img);
    return 0;
  }

  img->width = width;
  img->height = height;

  return img;
}

void Image_destroy(Image *img) {
  if (img) {
    if (img->data) free(img->data);
    free(img);
  }
}

extern inline void Image_set_pixel(Image *img, unsigned int x, unsigned int y, Pixel pixel) {
  if (x >= img->width) return;
  if (y >= img->height) return;
  img->data[y * img->width + x] = pixel;
}

extern inline Pixel Image_get_pixel(Image *img, unsigned int x, unsigned int y) {
  if (x >= img->width) return 0;
  if (y >= img->height) return 0;
  return img->data[y * img->width + x];
}

char Image_write_png_internal(Image *img, FILE *file, void *write_io_ptr, png_rw_ptr write_data_fn, png_flush_ptr output_flush_fn) {
  png_structp png = png_create_write_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
  if (!png) {
    return 0;
  }

  png_infop info = png_create_info_struct(png);
  if (!info) {
    png_destroy_write_struct(&png, (png_infopp)NULL);
    return 0;
  }

  if (setjmp(png_jmpbuf(png))) {
    png_destroy_info_struct(png, (png_infopp)&info);
    png_destroy_write_struct(&png, (png_infopp)&info);
    return 0;
  }

  if (file == NULL) {
    png_set_write_fn(png, write_io_ptr, write_data_fn, output_flush_fn);
  } else {
    png_init_io(png, file);
  }

  png_set_IHDR(png, info, img->width, img->height, 8, PNG_COLOR_TYPE_RGB, PNG_INTERLACE_NONE, PNG_COMPRESSION_TYPE_BASE, PNG_FILTER_TYPE_BASE);
  png_write_info(png, info);

  int x, y;
  Pixel pixel;
  png_bytep row = (png_bytep)malloc(img->width * 3 * sizeof(png_byte));

  for (y = 0; y < img->height; y++) {
    for (x = 0; x < img->width; x++) {
      pixel = Image_get_pixel(img, x, y);
      row[(x * 3) + 0] = Pixel_get_red(pixel);
      row[(x * 3) + 1] = Pixel_get_green(pixel);
      row[(x * 3) + 2] = Pixel_get_blue(pixel);
    }
    png_write_row(png, row);
  }

  free(row);
  png_write_end(png, NULL);
  png_destroy_info_struct(png, (png_infopp)&info);
  png_destroy_write_struct(&png, (png_infopp)&info);
  return 1;
}

char Image_write_png(Image *img, FILE *file) {
  return Image_write_png_internal(img, file, NULL, NULL, NULL);
}

void Image_get_png_write_data(png_structp png, png_bytep data, png_size_t length) {
  Buffer *buffer = (Buffer *)png_get_io_ptr(png);
  Buffer_append(buffer, length, data);
}

void Image_get_png_flush_data(png_structp png) {
}

char Image_get_png(Image *img, Buffer *buffer) {
  return Image_write_png_internal(img, NULL, (void *)buffer, Image_get_png_write_data, Image_get_png_flush_data);
}

char Image_downsample(Image *src, Image *dst) {
  if (dst->width > src->width) return 0;
  if (dst->height > src->height) return 0;

  int src_x, src_y, dst_x, dst_y, dst_offset, dst_offset_max = 0;
  Pixel src_pixel, dst_pixel;

  for (src_y = 0; src_y < src->height; src_y++) {
    for (src_x = 0; src_x < src->width; src_x++) {
      dst_x = lround((double) (dst->width * src_x) / (double) src->width);
      dst_y = lround((double) (dst->height * src_y) / (double) src->height);
      dst_offset = dst_y * dst->width + dst_x;

      src_pixel = Image_get_pixel(src, src_x, src_y);

      if (dst_offset > dst_offset_max) {
        Image_set_pixel(dst, dst_x, dst_y, src_pixel);
        dst_offset_max = dst_offset;
      } else {
        dst_pixel = Image_get_pixel(dst, dst_x, dst_y);
        Image_set_pixel(dst, dst_x, dst_y, (src_pixel + dst_pixel) / 2);
      }
    }
  }

  return 1;
}

void Image_invert(Image *img) {
  int x, y;
  Pixel pixel;

  for (y = 0; y < img->height; y++) {
    for (x = 0; x < img->width; x++) {
      pixel = Image_get_pixel(img, x, y);
      Image_set_pixel(img, x, y, MAX_PIXEL - pixel);
    }
  }
}

void Image_equalize(Image *img) {
  double histogram[MAX_PIXEL];
  double d = 1.0 / img->width / img->height;
  int i;

  for (i = 0; i < MAX_PIXEL; i++) {
    histogram[i] = 0;
  }

  int x, y;
  Pixel pixel;

  for (y = 0; y < img->height; y++) {
    for (x = 0; x < img->width; x++) {
      pixel = Image_get_pixel(img, x, y);
      histogram[pixel] += d;
    }
  }

  double sum = 0;
  Pixel lookup[MAX_PIXEL];

  for (i = 0; i < MAX_PIXEL; i++) {
    sum += histogram[i];
    lookup[i] = sum * (MAX_PIXEL - 1) + 0.5;
  }

  for (y = 0; y < img->height; y++) {
    for (x = 0; x < img->width; x++) {
      pixel = Image_get_pixel(img, x, y);
      Image_set_pixel(img, x, y, lookup[pixel]);
    }
  }
}
