all: kinect-depth-ascii kinect-depth-png

CFLAGS=-O3 -I/usr/local/include/libfreenect
LDFLAGS=-lpng -lfreenect

kinect-depth-ascii: kinect.o image.o buffer.o kinect-depth-ascii.c
	cc $(CFLAGS) $(LDFLAGS) -o $@ $^

kinect-depth-png: kinect.o image.o buffer.o kinect-depth-png.c
	cc $(CFLAGS) $(LDFLAGS) -o $@ $^

kinect.o: kinect.h kinect.c
	cc $(CFLAGS) -c kinect.c

image.o: image.h image.c
	cc $(CFLAGS) -c image.c

buffer.o: buffer.h buffer.c
	cc $(CFLAGS) -c buffer.c

clean:
	rm -f *.o kinect-depth-ascii kinect-depth-png
