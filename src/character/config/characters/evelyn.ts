/**
 * Evelyn - MYRAA's primary character (model 1739444010509).
 *
 * Every name below was read from the model itself with `tools/inspect-pmx.mjs`.
 * PMX models use Japanese MMD-standard names for bones and morphs; the embedded
 * English names in this particular model are duplicated and unreliable
 * (morphs 0, 1 and 2 all report "Fac_Eye_Close"), so the Japanese names are
 * authoritative and are what we key on.
 *
 * Model: "Evelyn" by 观海子. 30,788 vertices, 293 bones, 49 morphs,
 * 180 rigid bodies, 181 joints, 31 materials.
 */
import type { CharacterConfig } from '../types';

export const evelynConfig: CharacterConfig = {
  id: 'evelyn',
  displayName: 'Evelyn',
  modelUrl: '/assets/characters/evelyn/model.pmx',
  textureMapUrl: '/assets/characters/evelyn/textures.json',
  scale: 1,
  groundOffset: 0,

  bones: {
    root: '全ての親',
    center: 'センター',
    groove: 'グルーブ',
    waist: '腰',
    lowerBody: '下半身',
    upperBody: '上半身',
    upperBody2: '上半身2',
    neck: '首',
    head: '頭',
    eyes: '両目',
    eyeL: '左目',
    eyeR: '右目',
    shoulderL: '左肩',
    shoulderR: '右肩',
    armL: '左腕',
    armR: '右腕',
    elbowL: '左ひじ',
    elbowR: '右ひじ',
    wristL: '左手首',
    wristR: '右手首',
    thumb0L: '左親指０',
    thumb1L: '左親指１',
    thumb2L: '左親指２',
    index1L: '左人指１',
    index2L: '左人指２',
    index3L: '左人指３',
    middle1L: '左中指１',
    middle2L: '左中指２',
    middle3L: '左中指３',
    ring1L: '左薬指１',
    ring2L: '左薬指２',
    ring3L: '左薬指３',
    little1L: '左小指１',
    little2L: '左小指２',
    little3L: '左小指３',
    thumb0R: '右親指０',
    thumb1R: '右親指１',
    thumb2R: '右親指２',
    index1R: '右人指１',
    index2R: '右人指２',
    index3R: '右人指３',
    middle1R: '右中指１',
    middle2R: '右中指２',
    middle3R: '右中指３',
    ring1R: '右薬指１',
    ring2R: '右薬指２',
    ring3R: '右薬指３',
    little1R: '右小指１',
    little2R: '右小指２',
    little3R: '右小指３',
    legL: '左足',
    legR: '右足',
    kneeL: '左ひざ',
    kneeR: '右ひざ',
    ankleL: '左足首',
    ankleR: '右足首',
  },

  // The model is authored in MMD's A-pose, arms out at roughly 39 degrees
  // below horizontal. These offsets bring them down to a relaxed stance.
  // Left arm extends +X so a negative Z rotation lowers it; right arm is
  // mirrored. Small Y offsets bring the arms slightly forward of the coat.
  basePose: {
    armL: { z: -0.58, y: 0.1 },
    armR: { z: 0.58, y: -0.1 },
    elbowL: { z: -0.14, y: 0.22 },
    elbowR: { z: 0.14, y: -0.22 },
    wristL: { z: -0.05, y: 0.1 },
    wristR: { z: 0.05, y: -0.1 },
    shoulderL: { z: -0.04 },
    shoulderR: { z: 0.04 },
  },

  // See CharacterConfig.outline: this model's single-sided hair cards, coat
  // panels and face shell make back-face expansion paint over her.
  outline: { enabled: false, scale: 1 },

  morphs: {
    blink: 'まばたき',
    blinkL: 'ウィンク',
    blinkR: 'ウィンク右',
    smileEyes: '笑い',
    eyesWideL: 'びっくり左',
    eyesWideR: 'びっくり右',
    eyesHalf: 'じと目',
    eyesAngry: '怒り目',
    eyesAngry2: '怒り目２',
    eyesSad: '悲しむ',
    eyeOuterDown: '眼角下',
    lowerLidUp: '下眼上',

    visemeA: 'あ',
    visemeI: 'い',
    visemeU: 'う',
    visemeE: 'え',
    visemeO: 'お',
    visemeTalk: 'ワ',

    mouthSmile: 'にやり',
    mouthCornerUpL: '口角上げ左',
    mouthCornerUpR: '口角上げ右',
    mouthCornerDownL: '口角下げ左',
    mouthCornerDownR: '口角下げ右',
    mouthWiden: '口横広げ',
    mouthNarrow: '口横狭め',
    mouthShiftRight: '口右',
    mouthShiftLeft: '口左',
    mouthUp: '口上',
    mouthDown: '口下',
    mouthWidenL: '口横広げ左',
    mouthWidenR: '口横広げ右',
    mouthNarrowL: '口横狭め左',
    mouthNarrowR: '口横狭め右',
    teethUp: '齒上',
    teethDown: '齒下',

    // These are PMX *bone* morphs on this model, not vertex morphs.
    // MorphController handles both transparently.
    browAngry: '怒り',
    browSerious: '真面目',
    browSad: '悲しい',
    browTroubled: '困る',
    browUp: '上',
    browDown: '下',
    browAngryR: '怒り右',
  },

  materialRoles: {
    skin: ['肌'],
    face: ['颜', '痣'],
    eyeWhite: ['白目'],
    iris: ['目'],
    catchlight: ['目光', '目光2'],
    eyeShadow: ['目影'],
    lash: ['睫', '眉睫影'],
    brow: ['眉'],
    mouth: ['口'],
    teeth: ['齿'],
    tongue: ['舌'],
    hair: ['发', '侧发'],
    frontHair: ['前发'],
    metal: ['金属'],
    jewelry: ['珠宝'],
    // 皮裤 = leather trousers, 黑丝衣 / 胸衣 = the sheer panels. Leather has a
    // broad, soft sheen that matte fabric does not.
    leather: ['皮裤', '黑丝衣', '胸衣'],
    lightCloth: ['衬衣'],
    cloth: [
      '衣', '外套', '外套+',
      '领带', '领带+', '发带', '穗', '武器',
    ],
  },

  materialTuning: {
    // Skin: soft ramp, warm subsurface bleed at the terminator, low spec.
    skin: {
      // Skin shadow goes ROSY, never grey. This single value does more for
      // "premium anime" than any amount of light tuning.
      shadowTint: 0xd79a93,
      lightTint: 0xfff1e9,
      shadowMid: 0.56,
      secondShadow: 0.18,
      shadingSoftness: 0.4,
      shadowStrength: 0.72,
      // Neck and collarbone catch bounce off the chest; body skin keeps some
      // shadow so it does not flatten against the face.
      shadowReceive: 0.55,
      minLight: 0.3,
      viewKeyStrength: 0.84,
      brightness: 0.97,
      localContrast: 0.12,
      bounceStrength: 0.24,
      bounceTint: 0.5,
      warmth: 0.26,
      // Strong AO under the chin, in the neck and inside the collar.
      aoStrength: 0.68,
      rimStrength: 0.14,
      rimPower: 3.2,
      rimColor: 0xffd9c4,
      specularStrength: 0.06,
      specularPower: 24,
      subsurfaceStrength: 0.3,
      subsurfaceColor: 0xff8f6b,
      outlineWidth: 0.4,
      outlineColor: 0x6d4a48,
    },
    face: {
      // FACE PRIORITY.
      //
      // The face is the focal point and is lit to a different standard from
      // the rest of the character:
      //   - takes only a quarter of the cast shadow, so bangs shade it softly
      //     instead of masking the eyes
      //   - has an illumination floor it can never drop below
      //   - gets the strongest bounce, lifting chin, jaw and cheeks
      //   - carries the most warmth, so skin reads soft rather than grey
      lightingRig: 'face',
      // Hair shadow is KEPT - it just no longer dominates, because the face
      // rig's fill sits above the level at which it would swallow the face.
      shadowReceive: 0.38,
      // Final (post-rig) illumination floor. The shadow colour and terminator
      // remain intact above it, but the bangs can no longer make the face
      // resolve darker than the torso.
      minLight: 0.7,
      bounceStrength: 0.28,
      bounceTint: 0.55,
      warmth: 0.28,
      brightness: 0.99,
      localContrast: 0.12,
      // Slightly warmer and lighter than body skin, with a soft terminator:
      // the cheek gradient is what makes an anime face look painted.
      shadowTint: 0xe2aaa0,
      lightTint: 0xfff5ee,
      shadowMid: 0.63,
      secondShadow: 0.14,
      shadingSoftness: 0.5,
      shadowStrength: 0.7,
      // Extra depth around the eye sockets, nose and jaw comes from baked AO,
      // which is localised, rather than from crushing the whole shadow side.
      aoStrength: 0.6,
      rimStrength: 0.14,
      rimPower: 3.6,
      rimColor: 0xffd9c4,
      specularStrength: 0.06,
      specularPower: 28,
      subsurfaceStrength: 0.34,
      subsurfaceColor: 0xff8f6b,
      // The face reads best with almost no outline; heavy lines age it.
      outlineWidth: 0.22,
      outlineColor: 0x7a5250,
    },
    // The facial stack keeps depth writes so the layers occlude each other in
    // the order the model author intended. Only the catchlights, which must
    // composite over the iris, opt out. See AnimeMaterial for the reasoning.
    // The sclera takes a little AO from the lids and lashes so the eye sits
    // INSIDE the socket rather than floating on the face.
    eyeWhite: {
      lightingRig: 'face',
      // Sclera picks up a soft cool shadow from the upper lid, which is what
      // seats the eye in the socket instead of leaving it a flat white oval.
      // Like the iris, it is shielded from hair shadow.
      shadowReceive: 0,
      minLight: 0.84,
      shadowTint: 0xb4bad4,
      lightTint: 0xffffff,
      shadowMid: 0.55,
      secondShadow: 0.14,
      shadingSoftness: 0.45,
      shadowStrength: 0.6,
      aoStrength: 0.5,
      specularStrength: 0.05,
      saturation: 1,
      // Sclera should read as soft off-white, not a blown highlight.
      brightness: 0.72,
      outlineWidth: 0,
    },
    iris: {
      lightingRig: 'face',
      // The eye is where attention lands, so it is lit to its own standard:
      // never shadowed by hair, never allowed to go dim, and with a deep
      // violet upper-lid shadow so the iris has real depth rather than
      // reading as a flat coloured disc.
      shadowReceive: 0,
      minLight: 0.92,
      bounceStrength: 0,
      shadowTint: 0x6a5aa0,
      lightTint: 0xffffff,
      shadowMid: 0.44,
      secondShadow: 0.28,
      shadingSoftness: 0.4,
      shadowStrength: 0.6,
      brightness: 0.98,
      // The corneal reflection must be a TIGHT glint, not a broad sheen.
      // Because this term is additive, a high strength at a low exponent
      // floods the whole iris to white and destroys the colour; a high
      // exponent keeps it to a small, bright, wet-looking spot.
      // Two speculars in one: a very tight, near-white corneal glint plus a
      // rim that wraps the iris edge. Together they read as a wet, curved
      // surface - the difference between an eye and a painted circle.
      specularStrength: 0.62,
      specularPower: 140,
      specularWhiteness: 1,
      eyeReflectionStrength: 0.42,
      rimStrength: 0.3,
      rimPower: 2.4,
      rimWhiteness: 0.9,
      rimColor: 0xdfe4ff,
      emissiveStrength: 0.1,
      // Light AO only: the iris must stay bright inside the socket.
      aoStrength: 0.25,
      localContrast: 0.4,
      outlineWidth: 0,
    },
    // Catchlights stay unlit, never occluded and never tone mapped, so they
    // read as true speculars at full brightness in any lighting.
    catchlight: {
      unlit: true,
      blend: 'blend',
      emissiveStrength: 1,
      aoStrength: 0,
      outlineWidth: 0,
    },
    // Lashes, brows and eye shadow frame the eye and must stay crisp and
    // dark. They are shielded from cast shadow so the frame never dissolves,
    // and take no bounce - a lifted lash line kills the eye's definition.
    eyeShadow: {
      lightingRig: 'face',
      shadowReceive: 0, minLight: 0.55, bounceStrength: 0,
      shadingSoftness: 0.2, shadowStrength: 0.15, outlineWidth: 0,
    },
    lash: {
      lightingRig: 'face',
      shadowReceive: 0, minLight: 0.5, bounceStrength: 0, specularStrength: 0,
      shadingSoftness: 0.25, shadowStrength: 0.2, outlineWidth: 0,
    },
    brow: {
      lightingRig: 'face',
      shadowReceive: 0, minLight: 0.5, bounceStrength: 0, specularStrength: 0,
      shadingSoftness: 0.2, shadowStrength: 0.16, outlineWidth: 0,
    },
    mouth: { shadingSoftness: 0.4, shadowStrength: 0.25, specularStrength: 0.12, outlineWidth: 0 },
    teeth: { shadingSoftness: 0.25, shadowStrength: 0.18, specularStrength: 0.08, outlineWidth: 0 },
    tongue: { shadingSoftness: 0.4, shadowStrength: 0.28, specularStrength: 0.18, outlineWidth: 0 },
    // Hair: anisotropic band highlight is what sells anime hair.
    hair: {
      // Hair shadow stays warm and saturated rather than turning the fringe
      // into a cool grey-brown mass.
      shadowTint: 0xae9a78,
      lightTint: 0xf7dfbc,
      shadowMid: 0.54,
      secondShadow: 0.28,
      shadingSoftness: 0.24,
      shadowStrength: 0.68,
      shadowReceive: 0.62,
      minLight: 0.48,
      brightness: 0.97,
      localContrast: 0.12,
      // A camera-relative beauty softbox follows every orbit angle, so the
      // front and back receive the same polished hair treatment as the side.
      viewFillStrength: 0.68,
      viewTopStrength: 0.16,
      // A real camera-facing toon key: this moves the bangs onto the lit hair
      // tone instead of merely making their shadow tone brighter.
      viewKeyStrength: 0.9,
      frontFillTint: 0.08,
      // Heavy AO between strand layers is what gives anime hair its depth
      // rather than reading as one solid helmet.
      aoStrength: 0.76,
      // Hair highlights carry a good deal of the light's own colour - that is
      // what makes the anime band read - but not so much that dark hair would
      // be lifted.
      specularWhiteness: 0.18,
      rimWhiteness: 0.14,
      // Warm, weak rim. A strong blue rim was lifting the blue channel on
      // every grazing-angle strand and turning blonde hair grey.
      rimStrength: 0.14,
      rimPower: 3.2,
      rimColor: 0xfff0e2,
      specularStrength: 0.045,
      specularPower: 38,
      // The banded strand highlight is what actually sells anime hair, so it
      // carries more of the styling now that the rim carries less.
      anisotropicStrength: 0.14,
      anisotropicShift: 0.18,
      outlineWidth: 0.5,
      outlineColor: 0x2c2333,
    },
    // The PMX authors the fringe as a separate material (`前发`) with a
    // substantially darker texture region. Give it the direct, warm anime
    // beauty treatment the viewer expects instead of treating it as a cast
    // shadow over the face.
    frontHair: {
      shadowTint: 0xb9a079,
      lightTint: 0xf5ddb9,
      shadowMid: 0.44,
      secondShadow: 0.14,
      shadingSoftness: 0.34,
      shadowStrength: 0.52,
      shadowReceive: 0.36,
      minLight: 0.62,
      brightness: 0.98,
      localContrast: 0.1,
      viewKeyStrength: 0.92,
      viewFillStrength: 0.72,
      viewTopStrength: 0.16,
      frontFillTint: 0.08,
      aoStrength: 0.64,
      specularWhiteness: 0.18,
      rimWhiteness: 0.14,
      rimStrength: 0.12,
      rimPower: 3.2,
      rimColor: 0xfff0d8,
      specularStrength: 0.045,
      specularPower: 40,
      anisotropicStrength: 0.16,
      anisotropicShift: 0.16,
      outlineWidth: 0.45,
      outlineColor: 0x3a2d30,
    },
    lightCloth: {
      // The blouse is authored close to white, so it needs less fill and a
      // compressed highlight response than the dark coat materials.
      shadowTint: 0x9ca4b8,
      lightTint: 0xfff2e8,
      shadowMid: 0.5,
      secondShadow: 0.16,
      shadingSoftness: 0.36,
      shadowStrength: 0.68,
      shadowReceive: 0.68,
      minLight: 0.28,
      viewKeyStrength: 0.82,
      viewFillStrength: 0.72,
      brightness: 0.96,
      localContrast: 0.1,
      aoStrength: 0.62,
      specularWhiteness: 0.08,
      rimWhiteness: 0.08,
      rimStrength: 0.14,
      rimPower: 3.6,
      rimColor: 0xe6edfb,
      specularStrength: 0.055,
      specularPower: 24,
      outlineWidth: 0.48,
      outlineColor: 0x34313b,
    },
    cloth: {
      // Fabric shadow shifts cool and violet, which reads as a lit interior
      // rather than a grey smudge.
      shadowTint: 0x8792b0,
      lightTint: 0xfff8f0,
      shadowMid: 0.52,
      secondShadow: 0.28,
      shadingSoftness: 0.3,
      shadowStrength: 0.84,
      brightness: 0.99,
      localContrast: 0.14,
      // Deep AO in folds, under the collar and between coat panels.
      aoStrength: 0.72,
      // Fabric reflects its own colour, not white. Keeping these low is what
      // stops the dark trousers and corset being lifted toward grey.
      specularWhiteness: 0.15,
      rimWhiteness: 0.12,
      // Enough Fresnel to lift the silhouette off the dark stage, kept
      // near-neutral so it separates without draining warm fabrics.
      rimStrength: 0.26,
      rimPower: 3.4,
      rimColor: 0xe6edfb,
      specularStrength: 0.1,
      specularPower: 20,
      outlineWidth: 0.6,
      outlineColor: 0x241f2e,
    },
    // Leather sits between cloth and metal: a broad, soft sheen spread over a
    // wide area rather than cloth's matte falloff or metal's tight glint, and
    // a harder shading break because the material is stiff.
    leather: {
      shadowTint: 0x8990aa,
      lightTint: 0xfff6ef,
      shadowMid: 0.48,
      secondShadow: 0.24,
      shadingSoftness: 0.28,
      shadowStrength: 0.82,
      shadowReceive: 0.7,
      minLight: 0.34,
      viewKeyStrength: 0.86,
      viewFillStrength: 1.15,
      brightness: 1.03,
      localContrast: 0.1,
      aoStrength: 0.68,
      specularStrength: 0.22,
      specularPower: 14,
      specularWhiteness: 0.34,
      rimStrength: 0.2,
      rimPower: 3.2,
      rimWhiteness: 0.24,
      rimColor: 0xe6edfb,
      sphereStrength: 0.3,
      outlineWidth: 0.6,
      outlineColor: 0x1c1826,
    },
    metal: {
      // Metal is the opposite of cloth: it reflects the LIGHT's colour, so its
      // highlight goes near-white and stays tight.
      specularWhiteness: 0.9,
      rimWhiteness: 0.8,
      shadingSoftness: 0.18,
      shadowStrength: 0.55,
      rimStrength: 0.3,
      rimPower: 2.2,
      specularStrength: 0.4,
      specularPower: 48,
      outlineWidth: 0.45,
      outlineColor: 0x1e1a26,
    },
    jewelry: {
      // A bright, very tight glint - the smallest and hardest highlight on the
      // character, so it reads as a sparkle rather than a sheen.
      specularWhiteness: 1,
      rimWhiteness: 0.85,
      shadingSoftness: 0.14,
      shadowStrength: 0.5,
      rimStrength: 0.34,
      rimPower: 2,
      specularStrength: 0.5,
      specularPower: 64,
      emissiveStrength: 0.06,
      outlineWidth: 0.3,
      outlineColor: 0x1e1a26,
    },
  },

  camera: {
    // Framed from the upper chest so the face stays large and readable
    // while the coat and hair physics remain visible.
    targetBone: '上半身2',
    targetOffset: 1.2,
    distance: 22,
    fov: 30,
    heightOffset: 0.4,
    parallax: 0.055,
    minDistance: 8,
    maxDistance: 40,
  },

  // Calibrated so mid-tone skin lands around 0.9 of full white rather than
  // clipping. Toon shading replaces N.L with a near-unity ramp, so every light
  // contributes almost its full intensity regardless of direction - the total
  // across the rig matters far more than it would under a normal BRDF, and
  // values that look reasonable individually blow out when summed.
  lighting: {
    // Soft three-quarter key from camera-left, slightly above eye line.
    // Warm key dominates by roughly 6:1 over any single cool source. Toon
    // shading barely attenuates back lights on front-facing surfaces, so cool
    // fill/rim/hair must stay low or they tint the whole character blue.
    // Soft warm key, front and slightly above eye level, placed off-axis so
    // the nose and jaw cast real form shadow instead of flat frontal light.
    // These are NORMALISED FRACTIONS of full illumination, not photometric
    // intensities. The character shader sums them (see AnimeMaterial) and the
    // total on a fully-lit surface must land near 1.0, so the render
    // reproduces the texture instead of exceeding it. Pushing these higher
    // does not "brighten" the model - past 1.0 it only crushes colour toward
    // white, which is what was washing everything out.
    //
    //   lit side:    key 0.74 + ambient ~0.13            ~= 0.87
    //   shadow side: fill 0.20 + ambient ~0.13           ~= 0.33, hue-shifted
    keyIntensity: 0.74,
    keyColor: 0xfff0dc,
    keyAzimuth: 22,
    keyElevation: 18,
    // Cool fill from the opposite side, low and weak. It opens the shadow
    // side without erasing it - the shadow is the point.
    fillIntensity: 0.2,
    fillColor: 0xcddcff,
    fillAzimuth: -62,
    fillElevation: 4,
    // Deliberately faint: silhouette separation is done by the Fresnel rim
    // term inside the character shader, which is edge-accurate. This light
    // only adds a touch of colour to that edge.
    // Strong but soft white rim, high and behind, to lift hair and shoulders
    // off a dark background. Most of the visible edge comes from the shader's
    // Fresnel term; this supplies the light that makes it feel motivated.
    // These are accumulated additively by the character shader, gated on
    // facing away from the key, so they read as edge light. Values above ~0.35
    // start blowing out the silhouette rather than defining it.
    rimIntensity: 0.12,
    rimColor: 0xf2f6ff,
    rimAzimuth: 156,
    rimElevation: 34,
    // Dedicated overhead-rear light: the source of the hair's band highlight.
    hairLightIntensity: 0.07,
    hairLightColor: 0xeef4ff,
    // Invisible camera-relative front fill: guarantees the side facing the
    // viewer never goes dark, without reading as a lamp.
    frontFillIntensity: 0.24,
    frontFillColor: 0xfff2e6,

    // ---- portrait studio for the face --------------------------------------
    //
    // Laid out the way a photographer would light a face, and anchored to the
    // camera so it holds from any angle:
    //
    //   key    18 degrees camera-left, 11 up - close enough to the lens that
    //          the bangs cannot mask the eyes, off-axis enough to model the
    //          nose, cheekbone and jaw. This is the whole fix: the face is no
    //          longer shaped by the body's world key firing past her fringe.
    //   fill   broad, camera-axis and shadow-aware. It grows gently where the
    //          bangs block the key, keeping forehead, eyes and cheeks readable
    //          without deleting the hair-shadow colour or terminator.
    //   top    overhead sheen across forehead and cheekbones.
    //   rim    gentle edge lifting cheek and jaw off a dark background.
    //   bounce warm reflector under the chin, lifting jaw and throat.
    face: {
      keyAzimuth: 18,
      keyElevation: 11,
      keyIntensity: 0.64,
      keyColor: 0xfff0dc,
      fillIntensity: 0.33,
      fillColor: 0xfff4ea,
      topIntensity: 0.08,
      topColor: 0xf2f6ff,
      rimIntensity: 0.06,
      rimColor: 0xe8eeff,
      bounceIntensity: 0.11,
      bounceColor: 0xffd9bb,
    },
    // Subtle, directional-feeling ambient. Sky is cool, ground is a warm
    // bounce, so ambient itself carries a gradient rather than reading flat.
    ambientIntensity: 0.15,
    ambientSkyColor: 0xaebbd6,
    ambientGroundColor: 0x6b5a52,
    environmentIntensity: 0.14,
    // Self-shadowing ON, at a high map resolution and heavily softened.
    //
    // This is what puts real shadow on the face - hair over the forehead, the
    // jaw onto the neck, the collar under the chin - instead of lighting every
    // surface uniformly. It was previously disabled because the key light was
    // mistakenly positioned BEHIND the character, so self-shadowing crushed
    // the whole model. With the key correctly in front it reads as form.
    //
    // `opacity` keeps shadows open rather than black, which together with the
    // lifted toon ramp is how dark detail is preserved instead of crushed.
    shadow: {
      enabled: true,
      mapSize: 4096,
      // Wide PCF radius: soft, diffused edges, never a hard cut line.
      radius: 8,
      bias: -0.0006,
      normalBias: 0.05,
      // Kept light. At full strength the bangs drop a hard mask across the
      // eyes and lose them entirely - on an anime face the eyes must stay the
      // brightest, most legible feature under any lighting.
      opacity: 0.28,
    },
  },

  render: {
    // Khronos PBR Neutral, NOT ACES.
    //
    // ACES is a film emulation: it deliberately desaturates and rolls colour
    // toward white in the highlights. On a character whose whole appeal is
    // flat, accurate texture colour that is actively destructive - it is what
    // was turning skin, hair and clothing grey-white.
    //
    // Neutral is designed for the opposite goal: preserve hue and saturation,
    // compress ONLY genuine highlights, leave midtones alone. Combined with
    // the normalised light accumulator in AnimeMaterial (which keeps values at
    // or below 1.0), it passes the texture through essentially untouched and
    // only engages where there is a real specular highlight.
    //
    // Exposure sits at 1.0 by design. The lighting is normalised at source, so
    // exposure is not the brightness control - the per-light strengths are.
    exposure: 1,
    toneMapping: 'neutral',
    // Off by design: the character canvas is transparent so it composites
    // into MYRAA's holographic backdrop, and EffectComposer's bloom passes
    // do not preserve alpha. Glow is delivered by emissive catchlights and
    // jewellery plus the app's existing CSS glow layers. See Stage.ts.
    bloom: {
      enabled: false,
      strength: 0.34,
      radius: 0.65,
      threshold: 0.82,
    },
    antialias: true,
    maxPixelRatio: 2,
    targetFps: 60,
  },

  physics: {
    frequency: 60,
    maxSubSteps: 3,
    gravity: 9.8,
    globalAmplitude: 1,
    groups: {
      // 发带 = hair ribbon (24 bones), the model's longest chain.
      ribbon: {
        match: ['发带'],
        amplitude: 0.95,
        stiffness: 0.09,
        damping: 0.16,
        restPull: 0.12,
        maxAngleDeg: 26,
        gravityScale: 1,
        inertiaScale: 1.05,
      },
      // Side hair, bangs, loose strands, tassels, bun, knots.
      hair: {
        match: ['侧发', '刘海', '碎发', '发穗', '后发髻', '发结'],
        amplitude: 0.8,
        stiffness: 0.16,
        damping: 0.2,
        restPull: 0.26,
        maxAngleDeg: 17,
        gravityScale: 0.85,
        inertiaScale: 0.95,
      },
      // Coat panels and tails - heavier, slower, wider swing.
      coat: {
        match: ['外套', '中外套'],
        amplitude: 0.85,
        stiffness: 0.11,
        damping: 0.22,
        restPull: 0.2,
        maxAngleDeg: 21,
        gravityScale: 1.05,
        inertiaScale: 1,
      },
      sleeve: {
        match: ['外套袖'],
        amplitude: 0.7,
        stiffness: 0.15,
        damping: 0.24,
        restPull: 0.28,
        maxAngleDeg: 15,
        gravityScale: 0.9,
        inertiaScale: 0.9,
      },
      tie: {
        match: ['领带'],
        amplitude: 0.75,
        stiffness: 0.14,
        damping: 0.2,
        restPull: 0.24,
        maxAngleDeg: 18,
        gravityScale: 1,
        inertiaScale: 0.95,
      },
      // Deliberately the most restrained group: stiff, heavily damped and
      // angle-clamped so motion reads as natural cloth-and-body settling.
      chest: {
        match: ['胸'],
        amplitude: 0.3,
        stiffness: 0.34,
        damping: 0.42,
        restPull: 0.62,
        maxAngleDeg: 5,
        gravityScale: 0.35,
        inertiaScale: 0.4,
      },
      accessory: {
        match: ['耳坠', '环珠', '背坠', '腰环'],
        amplitude: 0.8,
        stiffness: 0.18,
        damping: 0.18,
        restPull: 0.22,
        maxAngleDeg: 20,
        gravityScale: 1,
        inertiaScale: 1,
      },
      // Hip/leg secondary bodies: very subtle, they only absorb weight shifts.
      lowerBody: {
        match: ['臀', '足', 'ひざ'],
        amplitude: 0.25,
        stiffness: 0.4,
        damping: 0.45,
        restPull: 0.6,
        maxAngleDeg: 5,
        gravityScale: 0.3,
        inertiaScale: 0.35,
      },
    },
    fallback: {
      match: [],
      amplitude: 0.6,
      stiffness: 0.18,
      damping: 0.24,
      restPull: 0.3,
      maxAngleDeg: 14,
      gravityScale: 0.9,
      inertiaScale: 0.85,
    },
  },

  idle: {
    breathRate: 0.23,
    breathDepth: 1,
    swayRate: 0.11,
    swayAmount: 1,
    postureIntervalMin: 7,
    postureIntervalMax: 17,
    blinkIntervalMin: 2.4,
    blinkIntervalMax: 7.5,
    doubleBlinkChance: 0.22,
    saccadeIntervalMin: 1.1,
    saccadeIntervalMax: 4.2,
  },

  behaviour: {
    intervalMin: 6,
    intervalMax: 15,
    noRepeatWindow: 4,
    busyIntervalScale: 2.2,
  },

  lipSync: {
    attack: 0.42,
    release: 0.2,
    gain: 1.5,
    noiseFloor: 0.035,
    maxWeight: 0.92,
    visemeBlendRate: 0.3,
  },
};
