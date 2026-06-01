using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

namespace SCPBreach
{
    public class SceneSetup : MonoBehaviour
    {
        private static Font _defaultFont;

        private static readonly Color BgColor = new Color(0.1f, 0.1f, 0.18f, 1f);
        private static readonly Color PanelColor = new Color(0.12f, 0.12f, 0.22f, 0.95f);
        private static readonly Color SlotColor = new Color(0.086f, 0.13f, 0.24f, 1f);
        private static readonly Color SlotBorder = new Color(0.2f, 0.3f, 0.5f, 1f);
        private static readonly Color ButtonColor = new Color(0.2f, 0.25f, 0.4f, 1f);
        private static readonly Color AccentColor = new Color(0.3f, 0.6f, 1f, 1f);

        private Canvas mainCanvas;
        private UIManager uiManager;
        private GameManager gameManager;
        private PlayerController playerController;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void AutoBoot()
        {
            if (Object.FindObjectOfType<SceneSetup>() == null && Object.FindObjectOfType<GameManager>() == null)
            {
                GameObject boot = new GameObject("GameBootstrap");
                boot.AddComponent<SceneSetup>();
            }
        }

        private static Font GetFont()
        {
            if (_defaultFont == null)
                _defaultFont = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            if (_defaultFont == null)
                _defaultFont = Resources.GetBuiltinResource<Font>("Arial.ttf");
            if (_defaultFont == null)
                _defaultFont = Font.CreateDynamicFontFromOSFont("Arial", 14);
            return _defaultFont;
        }

        private void Awake()
        {
            CreateEventSystem();
            CreateCanvas();
            CreateGameManager();
            GameObject cardPrefab = CreateCardPrefab();
            GameObject factionPanel = CreateFactionSelectPanel();
            GameObject gamePanel = CreateGameBoardPanel();
            GameObject winPanel = CreateWinScreenPanel();
            WireEverything(cardPrefab, factionPanel, gamePanel, winPanel);
        }

        private void CreateEventSystem()
        {
            if (FindObjectOfType<EventSystem>() == null)
            {
                GameObject esObj = new GameObject("EventSystem");
                esObj.AddComponent<EventSystem>();
                esObj.AddComponent<StandaloneInputModule>();
            }
        }

        private void CreateCanvas()
        {
            GameObject canvasObj = new GameObject("MainCanvas");
            mainCanvas = canvasObj.AddComponent<Canvas>();
            mainCanvas.renderMode = RenderMode.ScreenSpaceOverlay;
            mainCanvas.sortingOrder = 0;

            CanvasScaler scaler = canvasObj.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.matchWidthOrHeight = 0.5f;

            canvasObj.AddComponent<GraphicRaycaster>();

            // Background
            GameObject bgObj = new GameObject("Background");
            bgObj.transform.SetParent(canvasObj.transform, false);
            Image bgImage = bgObj.AddComponent<Image>();
            bgImage.color = BgColor;
            RectTransform bgRect = bgObj.GetComponent<RectTransform>();
            bgRect.anchorMin = Vector2.zero;
            bgRect.anchorMax = Vector2.one;
            bgRect.offsetMin = Vector2.zero;
            bgRect.offsetMax = Vector2.zero;
        }

        private void CreateGameManager()
        {
            GameObject gmObj = new GameObject("GameManager");
            gameManager = gmObj.AddComponent<GameManager>();
            gameManager.turnManager = gmObj.AddComponent<TurnManager>();
            gameManager.battleSystem = gmObj.AddComponent<BattleSystem>();
            gameManager.deckManager = gmObj.AddComponent<DeckManager>();

            GameObject uiObj = new GameObject("UIManager");
            uiManager = uiObj.AddComponent<UIManager>();
            gameManager.uiManager = uiManager;

            GameObject pcObj = new GameObject("PlayerController");
            playerController = pcObj.AddComponent<PlayerController>();
        }

        private GameObject CreateCardPrefab()
        {
            GameObject card = new GameObject("CardPrefab");
            card.SetActive(false);

            RectTransform cardRect = card.AddComponent<RectTransform>();
            cardRect.sizeDelta = new Vector2(120, 160);

            Image cardBg = card.AddComponent<Image>();
            cardBg.color = new Color(0.15f, 0.15f, 0.25f, 1f);

            card.AddComponent<Button>();

            CardUI cardUI = card.AddComponent<CardUI>();

            // Card name text
            GameObject nameObj = new GameObject("NameText");
            nameObj.transform.SetParent(card.transform, false);
            Text nameText = nameObj.AddComponent<Text>();
            nameText.font = GetFont();
            nameText.fontSize = 12;
            nameText.alignment = TextAnchor.UpperCenter;
            nameText.color = Color.white;
            RectTransform nameRect = nameObj.GetComponent<RectTransform>();
            nameRect.anchorMin = new Vector2(0, 0.6f);
            nameRect.anchorMax = new Vector2(1, 1f);
            nameRect.offsetMin = new Vector2(4, 0);
            nameRect.offsetMax = new Vector2(-4, -4);
            cardUI.nameText = nameText;

            // ATK text
            GameObject atkObj = new GameObject("ATKText");
            atkObj.transform.SetParent(card.transform, false);
            Text atkText = atkObj.AddComponent<Text>();
            atkText.font = GetFont();
            atkText.fontSize = 11;
            atkText.alignment = TextAnchor.LowerLeft;
            atkText.color = Color.white;
            RectTransform atkRect = atkObj.GetComponent<RectTransform>();
            atkRect.anchorMin = new Vector2(0, 0);
            atkRect.anchorMax = new Vector2(0.5f, 0.4f);
            atkRect.offsetMin = new Vector2(4, 4);
            atkRect.offsetMax = new Vector2(0, 0);
            cardUI.atkText = atkText;

            // DEF text
            GameObject defObj = new GameObject("DEFText");
            defObj.transform.SetParent(card.transform, false);
            Text defText = defObj.AddComponent<Text>();
            defText.font = GetFont();
            defText.fontSize = 11;
            defText.alignment = TextAnchor.LowerRight;
            defText.color = Color.white;
            RectTransform defRect = defObj.GetComponent<RectTransform>();
            defRect.anchorMin = new Vector2(0.5f, 0);
            defRect.anchorMax = new Vector2(1, 0.4f);
            defRect.offsetMin = new Vector2(0, 4);
            defRect.offsetMax = new Vector2(-4, 0);
            cardUI.defText = defText;

            cardUI.background = cardBg;

            return card;
        }

        private GameObject CreateFactionSelectPanel()
        {
            GameObject panel = new GameObject("FactionSelectPanel");
            panel.transform.SetParent(mainCanvas.transform, false);
            Image panelImg = panel.AddComponent<Image>();
            panelImg.color = PanelColor;
            RectTransform panelRect = panel.GetComponent<RectTransform>();
            panelRect.anchorMin = Vector2.zero;
            panelRect.anchorMax = Vector2.one;
            panelRect.offsetMin = Vector2.zero;
            panelRect.offsetMax = Vector2.zero;

            FactionSelectUI factionUI = panel.AddComponent<FactionSelectUI>();

            // Title
            GameObject titleObj = CreateTextObject(panel.transform, "Title", "SCP: BREACH - CARD GAME", 32, TextAnchor.UpperCenter);
            RectTransform titleRect = titleObj.GetComponent<RectTransform>();
            titleRect.anchorMin = new Vector2(0.1f, 0.85f);
            titleRect.anchorMax = new Vector2(0.9f, 0.95f);
            titleRect.offsetMin = Vector2.zero;
            titleRect.offsetMax = Vector2.zero;

            // Player 1 Section
            GameObject p1Label = CreateTextObject(panel.transform, "P1Label", "PLAYER 1 - Select Faction", 20, TextAnchor.MiddleCenter);
            SetRect(p1Label, 0.05f, 0.7f, 0.45f, 0.82f);

            GameObject p1MOG = CreateButton(panel.transform, "P1_MOG", "MOG", new Color(0.2f, 0.4f, 0.8f, 1f));
            SetRect(p1MOG, 0.08f, 0.55f, 0.2f, 0.68f);
            factionUI.p1MOGButton = p1MOG.GetComponent<Button>();

            GameObject p1Chaos = CreateButton(panel.transform, "P1_Chaos", "CHAOS", new Color(0.8f, 0.2f, 0.2f, 1f));
            SetRect(p1Chaos, 0.22f, 0.55f, 0.34f, 0.68f);
            factionUI.p1ChaosButton = p1Chaos.GetComponent<Button>();

            GameObject p1GOC = CreateButton(panel.transform, "P1_GOC", "GOC", new Color(0.2f, 0.7f, 0.3f, 1f));
            SetRect(p1GOC, 0.36f, 0.55f, 0.48f, 0.68f);
            factionUI.p1GOCButton = p1GOC.GetComponent<Button>();

            GameObject p1Selection = CreateTextObject(panel.transform, "P1Selection", "P1: Not Selected", 16, TextAnchor.MiddleCenter);
            SetRect(p1Selection, 0.05f, 0.45f, 0.45f, 0.53f);
            factionUI.p1SelectionText = p1Selection.GetComponent<Text>();

            // Player 2 Section
            GameObject p2Label = CreateTextObject(panel.transform, "P2Label", "PLAYER 2 - Select Faction", 20, TextAnchor.MiddleCenter);
            SetRect(p2Label, 0.55f, 0.7f, 0.95f, 0.82f);

            GameObject p2MOG = CreateButton(panel.transform, "P2_MOG", "MOG", new Color(0.2f, 0.4f, 0.8f, 1f));
            SetRect(p2MOG, 0.58f, 0.55f, 0.7f, 0.68f);
            factionUI.p2MOGButton = p2MOG.GetComponent<Button>();

            GameObject p2Chaos = CreateButton(panel.transform, "P2_Chaos", "CHAOS", new Color(0.8f, 0.2f, 0.2f, 1f));
            SetRect(p2Chaos, 0.72f, 0.55f, 0.84f, 0.68f);
            factionUI.p2ChaosButton = p2Chaos.GetComponent<Button>();

            GameObject p2GOC = CreateButton(panel.transform, "P2_GOC", "GOC", new Color(0.2f, 0.7f, 0.3f, 1f));
            SetRect(p2GOC, 0.86f, 0.55f, 0.98f, 0.68f);
            factionUI.p2GOCButton = p2GOC.GetComponent<Button>();

            GameObject p2Selection = CreateTextObject(panel.transform, "P2Selection", "P2: Not Selected", 16, TextAnchor.MiddleCenter);
            SetRect(p2Selection, 0.55f, 0.45f, 0.95f, 0.53f);
            factionUI.p2SelectionText = p2Selection.GetComponent<Text>();

            // Start Game button
            GameObject startBtn = CreateButton(panel.transform, "StartButton", "START GAME", AccentColor);
            SetRect(startBtn, 0.35f, 0.2f, 0.65f, 0.35f);
            factionUI.startGameButton = startBtn.GetComponent<Button>();

            return panel;
        }

        private GameObject CreateGameBoardPanel()
        {
            GameObject panel = new GameObject("GameBoardPanel");
            panel.transform.SetParent(mainCanvas.transform, false);
            RectTransform panelRect = panel.AddComponent<RectTransform>();
            panelRect.anchorMin = Vector2.zero;
            panelRect.anchorMax = Vector2.one;
            panelRect.offsetMin = Vector2.zero;
            panelRect.offsetMax = Vector2.zero;
            panel.SetActive(false);

            // Top Info Bar
            GameObject topBar = new GameObject("TopBar");
            topBar.transform.SetParent(panel.transform, false);
            Image topBarImg = topBar.AddComponent<Image>();
            topBarImg.color = PanelColor;
            SetRect(topBar, 0f, 0.92f, 1f, 1f);

            // P1 HP
            GameObject p1HPObj = CreateTextObject(topBar.transform, "P1HP", "P1 HP: 30/30", 18, TextAnchor.MiddleCenter);
            SetRect(p1HPObj, 0.02f, 0.1f, 0.2f, 0.9f);

            // P2 HP
            GameObject p2HPObj = CreateTextObject(topBar.transform, "P2HP", "P2 HP: 30/30", 18, TextAnchor.MiddleCenter);
            SetRect(p2HPObj, 0.8f, 0.1f, 0.98f, 0.9f);

            // Phase indicator
            GameObject phaseObj = CreateTextObject(topBar.transform, "Phase", "Phase: FactionSelect", 16, TextAnchor.MiddleCenter);
            SetRect(phaseObj, 0.3f, 0.1f, 0.5f, 0.9f);

            // Turn indicator
            GameObject turnObj = CreateTextObject(topBar.transform, "Turn", "Player 1's Turn", 16, TextAnchor.MiddleCenter);
            SetRect(turnObj, 0.5f, 0.1f, 0.7f, 0.9f);

            // Deck count
            GameObject deckObj = CreateTextObject(topBar.transform, "Deck", "", 14, TextAnchor.MiddleCenter);
            SetRect(deckObj, 0.22f, 0.1f, 0.3f, 0.9f);

            // Player 2 Field (top area)
            Transform[] p2Slots = CreateFieldSlots(panel.transform, "P2Field", 0.3f, 0.62f, 0.7f, 0.88f);

            // Player 1 Field (bottom area)
            Transform[] p1Slots = CreateFieldSlots(panel.transform, "P1Field", 0.3f, 0.32f, 0.7f, 0.58f);

            // Player 1 Hand (bottom)
            GameObject p1Hand = new GameObject("P1Hand");
            p1Hand.transform.SetParent(panel.transform, false);
            RectTransform p1HandRect = p1Hand.AddComponent<RectTransform>();
            SetRect(p1Hand, 0.1f, 0.02f, 0.75f, 0.28f);
            HorizontalLayoutGroup p1Layout = p1Hand.AddComponent<HorizontalLayoutGroup>();
            p1Layout.spacing = 8;
            p1Layout.childAlignment = TextAnchor.MiddleCenter;
            p1Layout.childForceExpandWidth = false;
            p1Layout.childForceExpandHeight = false;

            // Player 2 Hand (hidden by default, shown on their turn)
            GameObject p2Hand = new GameObject("P2Hand");
            p2Hand.transform.SetParent(panel.transform, false);
            RectTransform p2HandRect = p2Hand.AddComponent<RectTransform>();
            SetRect(p2Hand, 0.1f, 0.02f, 0.75f, 0.28f);
            HorizontalLayoutGroup p2Layout = p2Hand.AddComponent<HorizontalLayoutGroup>();
            p2Layout.spacing = 8;
            p2Layout.childAlignment = TextAnchor.MiddleCenter;
            p2Layout.childForceExpandWidth = false;
            p2Layout.childForceExpandHeight = false;

            // End Turn button
            GameObject endTurnBtn = CreateButton(panel.transform, "EndTurnButton", "END TURN", ButtonColor);
            SetRect(endTurnBtn, 0.8f, 0.05f, 0.95f, 0.15f);

            // Store references in a helper component
            GameBoardRefs refs = panel.AddComponent<GameBoardRefs>();
            refs.player1HPText = p1HPObj.GetComponent<Text>();
            refs.player2HPText = p2HPObj.GetComponent<Text>();
            refs.phaseText = phaseObj.GetComponent<Text>();
            refs.turnText = turnObj.GetComponent<Text>();
            refs.deckCountText = deckObj.GetComponent<Text>();
            refs.player1FieldSlots = p1Slots;
            refs.player2FieldSlots = p2Slots;
            refs.player1HandPanel = p1Hand.transform;
            refs.player2HandPanel = p2Hand.transform;
            refs.endTurnButton = endTurnBtn.GetComponent<Button>();

            return panel;
        }

        private GameObject CreateWinScreenPanel()
        {
            GameObject panel = new GameObject("WinScreenPanel");
            panel.transform.SetParent(mainCanvas.transform, false);
            Image panelImg = panel.AddComponent<Image>();
            panelImg.color = new Color(0, 0, 0, 0.85f);
            RectTransform panelRect = panel.GetComponent<RectTransform>();
            panelRect.anchorMin = Vector2.zero;
            panelRect.anchorMax = Vector2.one;
            panelRect.offsetMin = Vector2.zero;
            panelRect.offsetMax = Vector2.zero;
            panel.SetActive(false);

            // Winner text
            GameObject winText = CreateTextObject(panel.transform, "WinnerText", "Player X Wins!", 48, TextAnchor.MiddleCenter);
            SetRect(winText, 0.2f, 0.4f, 0.8f, 0.65f);

            WinPanelRef winRef = panel.AddComponent<WinPanelRef>();
            winRef.winnerText = winText.GetComponent<Text>();

            return panel;
        }

        private void WireEverything(GameObject cardPrefab, GameObject factionPanel, GameObject gamePanel, GameObject winPanel)
        {
            GameBoardRefs boardRefs = gamePanel.GetComponent<GameBoardRefs>();
            WinPanelRef winRef = winPanel.GetComponent<WinPanelRef>();

            // Wire UIManager
            uiManager.player1HPText = boardRefs.player1HPText;
            uiManager.player2HPText = boardRefs.player2HPText;
            uiManager.phaseIndicatorText = boardRefs.phaseText;
            uiManager.turnIndicatorText = boardRefs.turnText;
            uiManager.deckCountText = boardRefs.deckCountText;
            uiManager.player1FieldSlots = boardRefs.player1FieldSlots;
            uiManager.player2FieldSlots = boardRefs.player2FieldSlots;
            uiManager.player1HandPanel = boardRefs.player1HandPanel;
            uiManager.player2HandPanel = boardRefs.player2HandPanel;
            uiManager.endTurnButton = boardRefs.endTurnButton;
            uiManager.factionSelectPanel = factionPanel;
            uiManager.winScreenPanel = winPanel;
            uiManager.winnerText = winRef.winnerText;
            uiManager.cardPrefab = cardPrefab;

            // Wire End Turn button
            if (boardRefs.endTurnButton != null)
            {
                boardRefs.endTurnButton.onClick.AddListener(() =>
                {
                    playerController.OnEndTurnClicked();
                });
            }

            // Wire field slot clicks
            for (int i = 0; i < 3; i++)
            {
                int slotIndex = i;
                if (boardRefs.player1FieldSlots[i] != null)
                {
                    Button slotBtn = boardRefs.player1FieldSlots[i].GetComponent<Button>();
                    if (slotBtn == null)
                        slotBtn = boardRefs.player1FieldSlots[i].gameObject.AddComponent<Button>();
                    slotBtn.onClick.AddListener(() =>
                    {
                        playerController.OnFieldSlotClicked(slotIndex);
                    });
                }
                if (boardRefs.player2FieldSlots[i] != null)
                {
                    Button slotBtn = boardRefs.player2FieldSlots[i].GetComponent<Button>();
                    if (slotBtn == null)
                        slotBtn = boardRefs.player2FieldSlots[i].gameObject.AddComponent<Button>();
                    slotBtn.onClick.AddListener(() =>
                    {
                        playerController.OnFieldSlotClicked(slotIndex);
                    });
                }
            }

            // Show faction select at start
            factionPanel.SetActive(true);
            gamePanel.SetActive(true);
        }

        // --- Helper methods ---

        private GameObject CreateTextObject(Transform parent, string name, string content, int fontSize, TextAnchor alignment)
        {
            GameObject obj = new GameObject(name);
            obj.transform.SetParent(parent, false);
            obj.AddComponent<RectTransform>();
            Text text = obj.AddComponent<Text>();
            text.font = GetFont();
            text.text = content;
            text.fontSize = fontSize;
            text.alignment = alignment;
            text.color = Color.white;
            return obj;
        }

        private GameObject CreateButton(Transform parent, string name, string label, Color color)
        {
            GameObject btnObj = new GameObject(name);
            btnObj.transform.SetParent(parent, false);
            btnObj.AddComponent<RectTransform>();
            Image btnImg = btnObj.AddComponent<Image>();
            btnImg.color = color;
            btnObj.AddComponent<Button>();

            GameObject labelObj = new GameObject("Label");
            labelObj.transform.SetParent(btnObj.transform, false);
            RectTransform labelRect = labelObj.AddComponent<RectTransform>();
            labelRect.anchorMin = Vector2.zero;
            labelRect.anchorMax = Vector2.one;
            labelRect.offsetMin = Vector2.zero;
            labelRect.offsetMax = Vector2.zero;
            Text labelText = labelObj.AddComponent<Text>();
            labelText.font = GetFont();
            labelText.text = label;
            labelText.fontSize = 16;
            labelText.alignment = TextAnchor.MiddleCenter;
            labelText.color = Color.white;

            return btnObj;
        }

        private Transform[] CreateFieldSlots(Transform parent, string name, float xMin, float yMin, float xMax, float yMax)
        {
            GameObject container = new GameObject(name);
            container.transform.SetParent(parent, false);
            container.AddComponent<RectTransform>();
            SetRect(container, xMin, yMin, xMax, yMax);

            Transform[] slots = new Transform[3];
            float slotWidth = 1f / 3f;

            for (int i = 0; i < 3; i++)
            {
                GameObject slot = new GameObject("Slot_" + i);
                slot.transform.SetParent(container.transform, false);
                RectTransform slotRect = slot.AddComponent<RectTransform>();
                slotRect.anchorMin = new Vector2(slotWidth * i + 0.02f, 0.05f);
                slotRect.anchorMax = new Vector2(slotWidth * (i + 1) - 0.02f, 0.95f);
                slotRect.offsetMin = Vector2.zero;
                slotRect.offsetMax = Vector2.zero;

                Image slotImg = slot.AddComponent<Image>();
                slotImg.color = SlotColor;

                // Border effect via outline
                Outline outline = slot.AddComponent<Outline>();
                outline.effectColor = SlotBorder;
                outline.effectDistance = new Vector2(2, 2);

                slots[i] = slot.transform;
            }

            return slots;
        }

        private void SetRect(GameObject obj, float xMin, float yMin, float xMax, float yMax)
        {
            RectTransform rect = obj.GetComponent<RectTransform>();
            if (rect == null)
                rect = obj.AddComponent<RectTransform>();
            rect.anchorMin = new Vector2(xMin, yMin);
            rect.anchorMax = new Vector2(xMax, yMax);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }

    // Helper component to store game board references during setup
    public class GameBoardRefs : MonoBehaviour
    {
        public Text player1HPText;
        public Text player2HPText;
        public Text phaseText;
        public Text turnText;
        public Text deckCountText;
        public Transform[] player1FieldSlots;
        public Transform[] player2FieldSlots;
        public Transform player1HandPanel;
        public Transform player2HandPanel;
        public Button endTurnButton;
    }

    // Helper component to store win panel references during setup
    public class WinPanelRef : MonoBehaviour
    {
        public Text winnerText;
    }
}
