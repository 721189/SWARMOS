"""
Creates a valid PNG architecture banner for swarmos/architecture.png using standard library zlib & struct.
"""
import struct
import zlib
import os

def create_png(filename="swarmos/architecture.png", width=640, height=360):
    # Create raw RGBA image data
    # Dark navy slate background #0b1120
    bg_r, bg_g, bg_b = 15, 23, 42
    raw_data = bytearray()

    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            # Border frame
            if x < 4 or x > width - 5 or y < 4 or y > height - 5:
                r, g, b = 56, 189, 248  # Cyan border
            elif 40 <= y <= 80 and 40 <= x <= width - 40:
                # Top header card
                r, g, b = 30, 41, 59
            elif 120 <= y <= 220 and 40 <= x <= 200:
                # Box 1: Mission AI
                r, g, b = 118, 185, 0  # Nemotron green accent
            elif 120 <= y <= 220 and 240 <= x <= 400:
                # Box 2: CBBA Swarm Orchestrator
                r, g, b = 245, 158, 11  # Amber accent
            elif 120 <= y <= 220 and 440 <= x <= 600:
                # Box 3: Failure & X-AI
                r, g, b = 168, 85, 247  # Purple accent
            elif 260 <= y <= 320 and 40 <= x <= width - 40:
                # Swarm Mesh bar
                r, g, b = 15, 23, 42
                if x % 80 in [20, 21, 22, 23, 24] and 280 <= y <= 300:
                    r, g, b = 56, 189, 248  # Drone nodes
            else:
                # Gradient grid
                if (x % 30 == 0 or y % 30 == 0):
                    r, g, b = 25, 35, 55
                else:
                    r, g, b = bg_r, bg_g, bg_b

            raw_data.extend([r, g, b, 255])

    # Compress IDAT
    compressed = zlib.compress(bytes(raw_data), 9)

    def chunk(tag, data):
        c = tag + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack(">I", len(data)) + c + struct.pack(">I", crc)

    png_bytes = bytearray(b"\x89PNG\r\n\x1a\n")
    # IHDR: width, height, bit_depth=8, color_type=6 (RGBA), compression=0, filter=0, interlace=0
    png_bytes.extend(chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)))
    png_bytes.extend(chunk(b"IDAT", compressed))
    png_bytes.extend(chunk(b"IEND", b""))

    with open(filename, "wb") as f:
        f.write(png_bytes)
    print(f"Created {filename} successfully ({len(png_bytes)} bytes)")

if __name__ == "__main__":
    create_png()
