# SCP: Breach - Card Game (Unity Project)

## Description

A collectible card game (CCG) set in the SCP Foundation universe.
Two players battle using cards from 3 factions: MOG, Chaos Insurgency, and GOC.
Each faction has 30 unique cards with distinct stat distributions, plus 5 shared item cards.

## Requirements

- Unity 2021.3 LTS or newer (2022.3 also works)
- TextMeshPro package (included via Packages/manifest.json)

## Quick Start

1. Open this folder as a Unity project (File > Open Project, select the `unity-build` folder)
2. Unity will import all assets and compile scripts
3. If prompted to import TextMeshPro essentials, click "Import TMP Essentials"
4. Create a new Scene (File > New Scene) or open Assets/Scenes/MainScene
5. Create an empty GameObject (GameObject > Create Empty), name it "GameBootstrap"
6. Attach the `SceneSetup` script (from Assets/Scripts/) to the GameBootstrap object
7. Press Play - the entire game UI builds itself automatically!

## How to Play

- **Turn-based PvP**: Two players share one screen, taking turns
- **Faction Select**: Each player picks a faction (MOG / Chaos Insurgency / GOC)
- **Each Turn**:
  1. **Draw Phase**: Automatically draw 1 card (if deck is empty, take 3 HP damage)
  2. **Play Phase**: Click a card in hand, then click a field slot to place it (items activate instantly)
  3. Click "END TURN" to proceed to battle
  4. **Battle Phase**: Your field cards fight opposing cards automatically (mutual damage)
  5. Turn passes to opponent
- **Win Condition**: Reduce opponent HP from 30 to 0

## Factions

| Faction | Color | Strategy |
|---------|-------|----------|
| **MOG** | Blue | Balanced ATK/DEF - versatile playstyle |
| **Chaos Insurgency** | Red | High ATK, low DEF - aggressive rush |
| **GOC** | Green | Low ATK, high DEF - defensive wall |

## Item Cards

All factions share 5 item cards mixed into the deck:

- **SCP-500** (Panacea): Heal 5 HP
- **SCP-127** (Living Gun): Deal 4 damage to a random enemy field card
- **SCP-714** (Jade Ring): Give +3 DEF to one of your field cards
- **SCP-268** (Cap of Invisibility): Enemy skips their next battle phase
- **SCP-063** (Toothbrush): Destroy the enemy card with the lowest DEF

## Project Structure

```
Assets/
  Scripts/         - All C# game logic
    SceneSetup.cs  - Bootstrapper that creates full UI at runtime
    GameManager.cs - Main game controller (singleton)
    TurnManager.cs - Phase management (Draw/Play/Battle/End)
    BattleSystem.cs- Combat resolution and item effects
    DeckManager.cs - Deck building and card drawing
    PlayerController.cs - Input handling
    UIManager.cs   - UI state management
    CardUI.cs      - Individual card display
    FactionSelectUI.cs - Faction selection screen
    CardDatabase.cs- All 95 card definitions
    CardData.cs    - Card ScriptableObject definition
    CardInstance.cs- Runtime card state
    PlayerState.cs - Player HP, hand, field, deck
    Enums.cs       - Shared enumerations
  Scenes/          - Game scene
  Prefabs/         - (Card prefab created at runtime by SceneSetup)
  Resources/       - (Cards loaded programmatically via CardDatabase)
Packages/          - Unity package dependencies
ProjectSettings/   - Unity project settings
```

## Technical Notes

- All 95 cards are defined programmatically in `CardDatabase.cs` (no asset files needed)
- UI is built entirely at runtime by `SceneSetup.cs` (no prefab dependencies)
- The game works with just an empty scene + a single GameObject with `SceneSetup` attached
- No external textures or art assets required - cards are colored rectangles with text
- Screen resolution: designed for 1920x1080, scales with CanvasScaler

## Card Stats Overview

Each faction has cards in three tiers:
- **Weak** (10 cards): ~1-4 ATK, ~1-5 DEF
- **Medium** (10 cards): ~3-7 ATK, ~2-8 DEF
- **Strong** (10 cards): ~5-11 ATK, ~4-11 DEF

Total: 30 cards per faction + 5 items = 35 cards in each player's deck.
