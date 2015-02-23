#ifndef __BUFFER_H__
#define __BUFFER_H__

#include <stddef.h>

#ifdef DEBUG
#include <stdio.h>
#define Buffer_debug(message) fprintf(stderr, "%s\n", message)
#else
#define Buffer_debug(message)
#endif

struct BufferCell_t {
  size_t size;
  unsigned char *data;
};

typedef struct BufferCell_t BufferCell;

BufferCell *BufferCell_create(size_t, unsigned char *);
void BufferCell_destroy(BufferCell *);

struct Buffer_t {
  size_t size;
  size_t cell_count;
  size_t cells_size;
  size_t growth_size;
  BufferCell **cells;
};

typedef struct Buffer_t Buffer;

#define BUFFER_DEFAULT_GROWTH_SIZE 256

Buffer *Buffer_create();
Buffer *Buffer_create_with_growth_size(size_t);
void Buffer_destroy(Buffer *);
int Buffer_append(Buffer *, size_t, unsigned char *);
int Buffer_append_cell(Buffer *, BufferCell *);
unsigned char *Buffer_copy(Buffer *, unsigned char *, size_t);
unsigned char *Buffer_extract(Buffer *);
size_t Buffer_write(Buffer *, FILE *file);

#endif
