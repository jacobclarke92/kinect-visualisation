#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "buffer.h"

BufferCell *BufferCell_create(size_t size, unsigned char *data) {
  BufferCell *buffer_cell = (BufferCell *)malloc(sizeof(BufferCell));
  if (!buffer_cell) {
    return 0;
  }

  buffer_cell->size = size;
  buffer_cell->data = (unsigned char *)malloc(size);
  if (!buffer_cell->data) {
    free(buffer_cell);
    return 0;
  }

  memcpy(buffer_cell->data, data, size);

  return buffer_cell;
}

void BufferCell_destroy(BufferCell *buffer_cell) {
  if (buffer_cell) {
    if (buffer_cell->data) {
      free(buffer_cell->data);
    }

    free(buffer_cell);
  }
}

Buffer *Buffer_create() {
  return Buffer_create_with_growth_size(BUFFER_DEFAULT_GROWTH_SIZE);
}

Buffer *Buffer_create_with_growth_size(size_t growth_size) {
  Buffer *buffer = (Buffer *)malloc(sizeof(Buffer));
  if (!buffer) {
    return 0;
  }

  buffer->size = 0;
  buffer->cell_count = 0;
  buffer->cells_size = growth_size;
  buffer->growth_size = growth_size;
  buffer->cells = (BufferCell **)calloc(growth_size, sizeof(BufferCell *));
  if (!buffer->cells) {
    free(buffer);
    return 0;
  }

  return buffer;
}

void Buffer_destroy(Buffer *buffer) {
  if (buffer) {
    if (buffer->cells) {
      size_t i;
      BufferCell *buffer_cell;

      for (i = 0; i < buffer->cell_count; i++) {
        buffer_cell = buffer->cells[i];
        BufferCell_destroy(buffer_cell);
      }

      free(buffer->cells);
    }

    free(buffer);
  }
}

int Buffer_append(Buffer *buffer, size_t size, unsigned char *data) {
  if (!buffer) {
    return 0;
  }

  return Buffer_append_cell(buffer, BufferCell_create(size, data));
}

int Buffer_append_cell(Buffer *buffer, BufferCell *buffer_cell) {
  if (!buffer || !buffer_cell) {
    return 0;
  }

  if (buffer->cell_count == buffer->cells_size) {
    size_t cells_size = buffer->cells_size + buffer->growth_size;
    BufferCell **cells = (BufferCell **)calloc(cells_size, sizeof(BufferCell *));
    if (!cells) {
      return 0;
    }

    memcpy(cells, buffer->cells, buffer->cells_size);
    free(buffer->cells);
    buffer->cells_size = cells_size;
    buffer->cells = cells;
  }

  buffer->cells[buffer->cell_count] = buffer_cell;
  buffer->size += buffer_cell->size;
  buffer->cell_count++;

  return 1;
}

unsigned char *Buffer_copy(Buffer *buffer, unsigned char *data, size_t size) {
  if (!buffer || !data) {
    return 0;
  }

  if (size > buffer->size) {
    return 0;
  }

  size_t i, to_copy, copied = 0;
  BufferCell *buffer_cell;
  unsigned char *offset = data;
  unsigned char *result = data;

  for (i = 0; i < buffer->cell_count; i++) {
    buffer_cell = buffer->cells[i];
    to_copy = (size - copied) < buffer_cell->size ? (size - copied) : buffer_cell->size;
    if (to_copy <= 0) {
      break;
    }

    memcpy(offset, buffer_cell->data, to_copy);
    copied += to_copy;
    offset += buffer_cell->size;
  }

  return result;
}

unsigned char *Buffer_extract(Buffer *buffer) {
  unsigned char *data = (unsigned char *)malloc(buffer->size);
  if (!data) {
    return 0;
  }

  return Buffer_copy(buffer, data, buffer->size);
}

size_t Buffer_write(Buffer *buffer, FILE *file) {
  if (!buffer) {
    return 0;
  }

  size_t i, bytes_written, total_bytes_written = 0;
  BufferCell *buffer_cell;

  for (i = 0; i < buffer->cell_count; i++) {
    buffer_cell = buffer->cells[i];
    bytes_written = fwrite(buffer_cell->data, 1, buffer_cell->size, file);
    total_bytes_written += bytes_written;

    if (bytes_written != buffer_cell->size) {
      break;
    }
  }

  return total_bytes_written;
}
