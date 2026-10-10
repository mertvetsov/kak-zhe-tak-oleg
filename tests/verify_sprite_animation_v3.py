#!/usr/bin/env python3
"""Repository-level checks for the v3 investor and item sprite update."""

from pathlib import Path
import struct


ROOT = Path(__file__).resolve().parents[1]
ASSETS = {
    "investor-young-7-frames-v3.png": (2048, 292, 7),
    "investor-businesswoman-7-frames-v3.png": (2048, 292, 7),
    "investor-banker-7-frames-v3.png": (2048, 292, 7),
    "item-box-normal-6-frames-v3.png": (2048, 341, 6),
    "item-box-toxic-6-frames-v3.png": (2048, 341, 6),
    "item-unicorn-6-frames-v3.png": (2048, 341, 6),
}


def png_header(path: Path) -> tuple[int, int, int]:
    data = path.read_bytes()[:26]
    assert data[:8] == b"\x89PNG\r\n\x1a\n", f"{path.name}: not a PNG"
    width, height = struct.unpack(">II", data[16:24])
    return width, height, data[25]


def main() -> None:
    game = (ROOT / "game.js").read_text(encoding="utf-8")
    workflow = (ROOT / ".github/workflows/pr-preview.yml").read_text(encoding="utf-8")

    for name, (width, height, frame_count) in ASSETS.items():
        path = ROOT / "assets" / name
        actual_width, actual_height, color_type = png_header(path)
        assert (actual_width, actual_height) == (width, height), name
        assert color_type in {4, 6}, f"{name}: alpha channel required"
        assert f"assets/{name}" in game, f"{name}: not connected in game.js"
        boundaries = [round(index * width / frame_count) for index in range(frame_count + 1)]
        assert boundaries[0] == 0 and boundaries[-1] == width
        assert max(b - a for a, b in zip(boundaries, boundaries[1:])) - min(
            b - a for a, b in zip(boundaries, boundaries[1:])
        ) <= 1

    investor_block = game.split("function animatedInvestors", 1)[1].split("function house", 1)[0]
    assert "position.mirror" in investor_block, "right-side investors must be mirrored"
    assert game.count("mirror: false") == 2 and game.count("mirror: true") == 2
    assert "Math.floor(Math.random()*investorSprites.length)" in game
    assert "Math.round(index*image.naturalWidth/frameCount)" in game
    assert "Math.round((index+1)*image.naturalWidth/frameCount)" in game
    assert "scale: .8" in game and "scale: .65" in game
    assert "baseSize: 292" in game and "baseSize: 341" in game
    assert "mode: 'once-hold'" in game
    assert "holdSpin: .00045" in game
    assert game.count("pathPoint(item.lane,item.progress)") == 2
    assert "const CATCH_START = .70" in game and "const CATCH_END = .84" in game
    assert "const FLIGHT_SPEED_START = .00036" in game
    assert "const FLIGHT_SPEED_END = .00060" in game
    assert "game.playTime/DIFFICULTY_RAMP_MS" in game
    assert "FLIGHT_SPEED_START+ramp*(FLIGHT_SPEED_END-FLIGHT_SPEED_START)" in game
    assert "cp -R assets resources .publish/" in workflow

    print("v3 sprite animation checks passed")


if __name__ == "__main__":
    main()
