#!/usr/bin/env python3
"""Repository-level checks for the v3 investor and item sprite update."""

from pathlib import Path
import json
import struct


ROOT = Path(__file__).resolve().parents[1]
ASSETS = {
    "investor-young-7-frames-v3.png": (2048, 292, 7),
    "investor-businesswoman-7-frames-v3.png": (2048, 292, 7),
    "investor-banker-7-frames-v3.png": (2048, 292, 7),
    "investor-dirty-briefs-7x512-v2.png": (3584, 512, 7),
    "item-box-normal-6-frames-v3.png": (2048, 341, 6),
    "item-box-toxic-6-frames-v3.png": (2048, 341, 6),
    "item-unicorn-6-frames-v3.png": (2048, 341, 6),
    "item-dirty-briefs-6x512.png": (3072, 512, 6),
    "item-heart-6-frames.png": (3072, 512, 6),
    "oleg-left-low-dirty-briefs.png": (988, 1592, 1),
    "oleg-left-low-box-dirty-briefs.png": (988, 1591, 1),
    "oleg-left-up-dirty-briefs.png": (988, 1591, 1),
    "oleg-left-up-box-dirty-briefs.png": (988, 1591, 1),
    "oleg-cringe-butt-dance-loop-7x512.png": (3584, 512, 7),
    "oleg-cringe-chicken-shimmy-loop-7x512.png": (3584, 512, 7),
    "oleg-dropped-box-cry-loop-7x512-v2.png": (3584, 512, 7),
    "oleg-toxic-surprise-7x512-v4-style-match.png": (3584, 512, 7),
}


def png_header(path: Path) -> tuple[int, int, int]:
    data = path.read_bytes()[:26]
    assert data[:8] == b"\x89PNG\r\n\x1a\n", f"{path.name}: not a PNG"
    width, height = struct.unpack(">II", data[16:24])
    return width, height, data[25]


def main() -> None:
    game = (ROOT / "game.js").read_text(encoding="utf-8")
    workflow = (ROOT / ".github/workflows/pr-preview.yml").read_text(encoding="utf-8")
    underwear_lines = json.loads((ROOT / "resources" / "underwear-exclamations.json").read_text(encoding="utf-8"))
    oleg_lines = json.loads((ROOT / "resources" / "oleg-exclamations.json").read_text(encoding="utf-8"))
    assert set(underwear_lines) == {"activate", "deactivate"}
    assert all(len(underwear_lines[group]) == 3 for group in underwear_lines)
    assert all(isinstance(line, str) and line for group in underwear_lines.values() for line in group)
    assert "heart" in oleg_lines and all(isinstance(line, str) and line for line in oleg_lines["heart"])
    background = ROOT / "assets" / "oleg-new-background-green.png"
    assert png_header(background)[:2] == (1584, 993), "new background dimensions"
    assert "assets/oleg-new-background-green.png" in game, "new background not connected"

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
    assert "Math.random()<UNDERWEAR_INVESTOR_CHANCE?UNDERWEAR_INVESTOR_INDEX" in game
    assert "actor===UNDERWEAR_INVESTOR_INDEX?'underwear':rollItemType()" in game
    assert "const UNDERWEAR_INVESTOR_CHANCE = .07" in game
    assert "const UNDERWEAR_EFFECT_DURATION_MS = 10000" in game
    assert "Math.round(index*image.naturalWidth/frameCount)" in game
    assert "Math.round((index+1)*image.naturalWidth/frameCount)" in game
    assert "scale: .8" in game and "scale: .65" in game
    assert "baseSize: 292" in game and "baseSize: 341" in game
    assert "mode: 'once-hold'" in game
    assert "heart: { mode: 'open-loop'" in game
    assert "rawFrame<4?rawFrame:4+(rawFrame-4)%2" in game
    assert "const ITEM_CHANCES = { heartStart:.10, heartEnd:.03" in game
    assert "heartChance=ITEM_CHANCES.heartStart+ramp*(ITEM_CHANCES.heartEnd-ITEM_CHANCES.heartStart)" in game
    assert "holdSpin: .0032" in game
    assert "(config.holdSpin-config.spin)*elapsed*elapsed/(2*duration)" in game
    assert "a.type==='toxic'?itemAnimation(a,a.flightElapsed+a.t).rotation" in game
    assert "horizontalFrame(danceSprite,7,frame" in game
    assert "Math.floor(Math.random()*danceSprites.length)" in game
    assert "if(type==='unicorn'){game.movedSinceCatch=false;game.message='ЕДИНОРОГ!';queueRandomDance()" in game
    assert "game.reaction==='unicorn'&&game.reactionClock>1250){game.reaction='dance'" in game
    assert "const DANCE_FRAME_MS = 100" in game
    assert "const DANCE_DURATION_MS = 1600" in game
    assert "const DANCE_FOOT_Y = 499" in game
    assert "beep('dance')" in game
    assert "const DROPPED_CRY_FOOT_Y = 499" in game
    assert "DROPPED_CRY_FRAME_MS)%7,size=300" in game
    assert "horizontalFrame(droppedCrySprites,7,frame" in game
    assert "game.missLane>=2" in game
    assert "const TOXIC_REACTION_FOOT_Y = 499" in game
    assert game.count("horizontalFrame(toxicSurpriseSprites,7,frame,480-size/2,y,size,size,0,game.missLane>=2)") == 2
    assert "game.gameOverCause==='toxic'" in game
    assert "5+Math.floor((elapsed-openingDuration)/220)%2" in game
    assert "triggerGameover(lostWhileBlind?'miss':'toxic')" in game
    assert "filter.frequency.exponentialRampToValueAtTime(120,t+.82)" in game
    assert "underwearEffect:{active:false,remainingMs:0,durationMs:UNDERWEAR_EFFECT_DURATION_MS}" in game
    assert "function chooseButton(requestedLane){choose(game.underwearEffect.active?3-requestedLane:requestedLane)}" in game
    assert "left:'right',right:'left',up:'down',down:'up'" in game
    assert "if(actual==='left')choose(game.lane<2?game.lane:game.lane-2)" in game
    assert "else if(actual==='up')choose(game.lane<2?0:2)" in game
    assert "showHype(underwearLines.activate);beep('underwearOn')" in game
    assert "showHype(underwearLines.deactivate);beep('underwearOff')" in game
    assert "game.underwearEffect.remainingMs=Math.max(0,game.underwearEffect.remainingMs-dt)" in game
    assert "deactivateUnderwearEffect(false);game.lives=0" in game
    assert "if(item.type==='toxic'||item.type==='underwear'||item.type==='heart')return" in game
    assert "['miss','toxic','underwear','heart','dance'].includes(game.reaction)" in game
    assert "function choose(lane){if(!game.running||game.paused)return;interruptReaction();if(lane!==game.lane)" in game
    assert game.count("pathPoint(item.lane,item.progress)") == 2
    assert "const CATCH_START = .70" in game and "const CATCH_END = .84" in game
    assert "const FLIGHT_SPEED_START = .00036" in game
    assert "const FLIGHT_SPEED_END = .00068" in game
    assert "const SPAWN_INTERVAL_START_MS = 1050" in game
    assert "const SPAWN_INTERVAL_END_MS = 480" in game
    assert "audioResumePromise ||= audio.resume()" in game
    assert "game.playTime/DIFFICULTY_RAMP_MS" in game
    assert "FLIGHT_SPEED_START+ramp*(FLIGHT_SPEED_END-FLIGHT_SPEED_START)" in game
    assert "cp -R assets resources .publish/" in workflow

    print("v3 sprite animation checks passed")


if __name__ == "__main__":
    main()
