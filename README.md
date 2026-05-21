# Randomizer

**Chaos, on tap.** Smash randomness into your selected After Effects layers — position, rotation, scale, opacity — with ranges, modes, and a tasteful undo group so you don't burn the timeline.

![Window → Extensions → Randomizer](client/logo.png)

---

## What it does

One panel. Four cards. Each card randomizes one transform property on every selected layer:

- **Position** — random X / Y / Z offsets within ranges you set. Choose **Add** (jitter) or **Set** (yeet to coordinates).
- **Rotation** — degrees per axis. 2D rotates Z; 3D layers can do X / Y / Z independently.
- **Scale** — uniform or per-axis. **Set** to absolute %, or **Multiply** to scramble existing scale.
- **Opacity** — random % within range.

Toggle any card off to skip it. There's also a big **Randomize All** button at the bottom for when you want a single click of pure entropy.

Everything wraps in a single undo group, so one `Ctrl+Z` puts it back the way it was.

---

## Install

1. Head to the **[Releases page](https://github.com/MickeyAeScripts/ae-randomizer/releases/latest)** and grab `Randomizer-vX.Y.Z.zxp`.
2. Install with either free tool:
   - **[ZXP Installer (aescripts)](https://aescripts.com/learn/zxp-installer/)** — open it, drag the `.zxp` in.
   - **[Anastasiy's Extension Manager](https://install.anastasiy.com/)** — same vibe.
3. Restart After Effects.
4. **Window → Extensions → Randomizer**.

The cert is self-signed, so the installer might mutter something about "publisher not verified" — click through.

---

## Use it

1. Select one or more **unlocked** layers in any comp.
2. Open the panel (Window → Extensions → Randomizer).
3. Set your ranges, pick Add/Set/Multiply, hit the button.
4. Don't like it? `Ctrl+Z`. Try again.

Locked layers get politely skipped.

---

## Requirements

- After Effects 2022 (22.0) or newer
- CEP 9.0+ (ships with AE)

---

## Build it yourself

If you'd rather build the `.zxp` locally instead of grabbing the release:

```bash
# Grab Adobe's ZXPSignCmd from the Adobe-CEP repo:
# https://github.com/Adobe-CEP/CEP-Resources/tree/master/ZXPSignCMD

# Stage the extension folder
mkdir -p build/Randomizer
cp -r CSXS client jsx build/Randomizer/

# Self-signed cert (one-time)
ZXPSignCmd -selfSignedCert US CA "You" "You" "pass" cert.p12

# Sign → ZXP
ZXPSignCmd -sign build/Randomizer Randomizer.zxp cert.p12 pass
```

Or just push a `v*` tag and let GitHub Actions do it.

---

## Tech

CEP 9 panel — HTML/CSS/JS frontend (`client/`) talks to ExtendScript backend (`jsx/`) via `evalScript`. Manifest at `CSXS/manifest.xml`. The randomizer math itself is dead simple — `min + Math.random() * (max - min)` for each picked range.
