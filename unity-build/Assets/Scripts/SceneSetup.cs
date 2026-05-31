using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using TMPro;

namespace SCPBreach
{
    public class SceneSetup : MonoBehaviour
    {
        // Colors
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
            GameObject esGO = new GameObject("EventSystem");
            esGO.AddComponent<EventSystem>();
            esGO.AddComponent<StandaloneInputModule>();
        }

        private void CreateCanvas()
        {
            GameObject canvasGO = new GameObject("MainCanvas");
            mainCanvas = canvasGO.AddComponent<Canvas>();
            mainCanvas.renderMode = RenderMode.ScreenSpaceOverlay;
            mainCanvas.sortingOrder = 0;

            CanvasScaler scaler = canvasGO.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.matchWidthOrHeight = 0.5f;

            canvasGO.AddComponent<GraphicRaycaster>();
            uiManager = canvasGO.AddComponent<UIManager>();

            // Full screen background
            GameObject bgGO = CreateUIElement("Background", canvasGO.transform);
            SetFullStretch(bgGO.GetComponent<RectTransform>());
            Image bgImg = bgGO.AddComponent<Image>();
            bgImg.color = BgColor;
        }

        private void CreateGameManager()
        {
            GameObject gmGO = new GameObject("GameManager");
            gameManager = gmGO.AddComponent<GameManager>();
            gameManager.turnManager = gmGO.AddComponent<TurnManager>();
            gameManager.battleSystem = gmGO.AddComponent<BattleSystem>();
            gameManager.deckManager = gmGO.AddComponent<DeckManager>();
            playerController = gmGO.AddComponent<PlayerController>();
        }

        private GameObject CreateCardPrefab()
        {
            GameObject card = CreateUIElement("CardPrefab", mainCanvas.transform);
            RectTransform cardRT = card.GetComponent<RectTransform>();
            cardRT.sizeDelta = new Vector2(120, 180);

            Image cardBg = card.AddComponent<Image>();
            cardBg.color = new Color(0.2f, 0.4f, 0.8f, 1f);

            Button cardBtn = card.AddComponent<Button>();
            cardBtn.targetGraphic = cardBg;

            CardUI cardUI = card.AddComponent<CardUI>();
            cardUI.background = cardBg;

            // Card Name Text (top)
            GameObject nameGO = CreateUIElement("NameText", card.transform);
            RectTransform nameRT = nameGO.GetComponent<RectTransform>();
            nameRT.anchorMin = new Vector2(0, 0.65f);
            nameRT.anchorMax = new Vector2(1, 1f);
            nameRT.offsetMin = new Vector2(4, 0);
            nameRT.offsetMax = new Vector2(-4, -4);
            TextMeshProUGUI nameText = nameGO.AddComponent<TextMeshProUGUI>();
            nameText.text = "Card Name";
            nameText.fontSize = 14;
            nameText.alignment = TextAlignmentOptions.Top;
            nameText.color = Color.white;
            nameText.enableWordWrapping = true;
            cardUI.nameText = nameText;

            // ATK Text (bottom left)
            GameObject atkGO = CreateUIElement("ATKText", card.transform);
            RectTransform atkRT = atkGO.GetComponent<RectTransform>();
            atkRT.anchorMin = new Vector2(0, 0);
            atkRT.anchorMax = new Vector2(0.5f, 0.25f);
            atkRT.offsetMin = new Vector2(4, 4);
            atkRT.offsetMax = new Vector2(0, 0);
            TextMeshProUGUI atkText = atkGO.AddComponent<TextMeshProUGUI>();
            atkText.text = "ATK: 0";
            atkText.fontSize = 12;
            atkText.alignment = TextAlignmentOptions.BottomLeft;
            atkText.color = Color.white;
            cardUI.atkText = atkText;

            // DEF Text (bottom right)
            GameObject defGO = CreateUIElement("DEFText", card.transform);
            RectTransform defRT = defGO.GetComponent<RectTransform>();
            defRT.anchorMin = new Vector2(0.5f, 0);
            defRT.anchorMax = new Vector2(1, 0.25f);
            defRT.offsetMin = new Vector2(0, 4);
            defRT.offsetMax = new Vector2(-4, 0);
            TextMeshProUGUI defText = defGO.AddComponent<TextMeshProUGUI>();
            defText.text = "DEF: 0";
            defText.fontSize = 12;
            defText.alignment = TextAlignmentOptions.BottomRight;
            defText.color = Color.white;
            cardUI.defText = defText;

            // Disable and use as template
            card.SetActive(false);
            return card;
        }

        private GameObject CreateFactionSelectPanel()
        {
            GameObject panel = CreateUIElement("FactionSelectPanel", mainCanvas.transform);
            SetFullStretch(panel.GetComponent<RectTransform>());
            Image panelImg = panel.AddComponent<Image>();
            panelImg.color = new Color(0.05f, 0.05f, 0.12f, 0.98f);

            FactionSelectUI fsUI = panel.AddComponent<FactionSelectUI>();

            // Title
            GameObject titleGO = CreateUIElement("Title", panel.transform);
            RectTransform titleRT = titleGO.GetComponent<RectTransform>();
            titleRT.anchorMin = new Vector2(0.2f, 0.8f);
            titleRT.anchorMax = new Vector2(0.8f, 0.95f);
            titleRT.offsetMin = Vector2.zero;
            titleRT.offsetMax = Vector2.zero;
            TextMeshProUGUI titleText = titleGO.AddComponent<TextMeshProUGUI>();
            titleText.text = "SCP: Breach - Card Game";
            titleText.fontSize = 48;
            titleText.alignment = TextAlignmentOptions.Center;
            titleText.color = AccentColor;

            // Player 1 Section
            GameObject p1Label = CreateUIElement("P1Label", panel.transform);
            RectTransform p1LabelRT = p1Label.GetComponent<RectTransform>();
            p1LabelRT.anchorMin = new Vector2(0.1f, 0.6f);
            p1LabelRT.anchorMax = new Vector2(0.9f, 0.7f);
            p1LabelRT.offsetMin = Vector2.zero;
            p1LabelRT.offsetMax = Vector2.zero;
            TextMeshProUGUI p1LabelText = p1Label.AddComponent<TextMeshProUGUI>();
            p1LabelText.text = "Player 1 - Choose Faction:";
            p1LabelText.fontSize = 24;
            p1LabelText.alignment = TextAlignmentOptions.Center;
            p1LabelText.color = Color.white;

            // Player 1 buttons
            Button p1MOG = CreateFactionButton("P1_MOG", panel.transform, "MOG", new Vector2(0.25f, 0.5f), new Color(0.13f, 0.59f, 0.95f, 1f));
            Button p1Chaos = CreateFactionButton("P1_Chaos", panel.transform, "Chaos", new Vector2(0.5f, 0.5f), new Color(0.96f, 0.26f, 0.21f, 1f));
            Button p1GOC = CreateFactionButton("P1_GOC", panel.transform, "GOC", new Vector2(0.75f, 0.5f), new Color(0.3f, 0.69f, 0.31f, 1f));

            // P1 selection text
            GameObject p1SelGO = CreateUIElement("P1Selection", panel.transform);
            RectTransform p1SelRT = p1SelGO.GetComponent<RectTransform>();
            p1SelRT.anchorMin = new Vector2(0.1f, 0.42f);
            p1SelRT.anchorMax = new Vector2(0.9f, 0.48f);
            p1SelRT.offsetMin = Vector2.zero;
            p1SelRT.offsetMax = Vector2.zero;
            TextMeshProUGUI p1SelText = p1SelGO.AddComponent<TextMeshProUGUI>();
            p1SelText.text = "";
            p1SelText.fontSize = 20;
            p1SelText.alignment = TextAlignmentOptions.Center;
            p1SelText.color = Color.yellow;

            // Player 2 Section
            GameObject p2Label = CreateUIElement("P2Label", panel.transform);
            RectTransform p2LabelRT = p2Label.GetComponent<RectTransform>();
            p2LabelRT.anchorMin = new Vector2(0.1f, 0.32f);
            p2LabelRT.anchorMax = new Vector2(0.9f, 0.42f);
            p2LabelRT.offsetMin = Vector2.zero;
            p2LabelRT.offsetMax = Vector2.zero;
            TextMeshProUGUI p2LabelText = p2Label.AddComponent<TextMeshProUGUI>();
            p2LabelText.text = "Player 2 - Choose Faction:";
            p2LabelText.fontSize = 24;
            p2LabelText.alignment = TextAlignmentOptions.Center;
            p2LabelText.color = Color.white;

            // Player 2 buttons
            Button p2MOG = CreateFactionButton("P2_MOG", panel.transform, "MOG", new Vector2(0.25f, 0.22f), new Color(0.13f, 0.59f, 0.95f, 1f));
            Button p2Chaos = CreateFactionButton("P2_Chaos", panel.transform, "Chaos", new Vector2(0.5f, 0.22f), new Color(0.96f, 0.26f, 0.21f, 1f));
            Button p2GOC = CreateFactionButton("P2_GOC", panel.transform, "GOC", new Vector2(0.75f, 0.22f), new Color(0.3f, 0.69f, 0.31f, 1f));

            // P2 selection text
            GameObject p2SelGO = CreateUIElement("P2Selection", panel.transform);
            RectTransform p2SelRT = p2SelGO.GetComponent<RectTransform>();
            p2SelRT.anchorMin = new Vector2(0.1f, 0.14f);
            p2SelRT.anchorMax = new Vector2(0.9f, 0.2f);
            p2SelRT.offsetMin = Vector2.zero;
            p2SelRT.offsetMax = Vector2.zero;
            TextMeshProUGUI p2SelText = p2SelGO.AddComponent<TextMeshProUGUI>();
            p2SelText.text = "";
            p2SelText.fontSize = 20;
            p2SelText.alignment = TextAlignmentOptions.Center;
            p2SelText.color = Color.yellow;

            // Start button
            Button startBtn = CreateStyledButton("StartButton", panel.transform, "START GAME",
                new Vector2(0.35f, 0.04f), new Vector2(0.65f, 0.12f), new Color(0.1f, 0.6f, 0.1f, 1f));
            startBtn.interactable = false;

            // Wire FactionSelectUI
            fsUI.p1MOGButton = p1MOG;
            fsUI.p1ChaosButton = p1Chaos;
            fsUI.p1GOCButton = p1GOC;
            fsUI.p2MOGButton = p2MOG;
            fsUI.p2ChaosButton = p2Chaos;
            fsUI.p2GOCButton = p2GOC;
            fsUI.startGameButton = startBtn;
            fsUI.p1SelectionText = p1SelText;
            fsUI.p2SelectionText = p2SelText;

            return panel;
        }

        private GameObject CreateGameBoardPanel()
        {
            GameObject panel = CreateUIElement("GameBoardPanel", mainCanvas.transform);
            SetFullStretch(panel.GetComponent<RectTransform>());
            Image panelImg = panel.AddComponent<Image>();
            panelImg.color = new Color(0, 0, 0, 0); // transparent, bg already covers
            panel.SetActive(false);

            // === TOP AREA: Player 2 Info ===
            GameObject p2Area = CreateUIElement("P2Area", panel.transform);
            RectTransform p2AreaRT = p2Area.GetComponent<RectTransform>();
            p2AreaRT.anchorMin = new Vector2(0, 0.75f);
            p2AreaRT.anchorMax = new Vector2(0.82f, 1f);
            p2AreaRT.offsetMin = new Vector2(10, 0);
            p2AreaRT.offsetMax = new Vector2(0, -10);

            // P2 HP Text
            GameObject p2HPTextGO = CreateUIElement("P2HPText", p2Area.transform);
            RectTransform p2HPRT = p2HPTextGO.GetComponent<RectTransform>();
            p2HPRT.anchorMin = new Vector2(0, 0.7f);
            p2HPRT.anchorMax = new Vector2(0.3f, 1f);
            p2HPRT.offsetMin = Vector2.zero;
            p2HPRT.offsetMax = Vector2.zero;
            TextMeshProUGUI p2HPText = p2HPTextGO.AddComponent<TextMeshProUGUI>();
            p2HPText.text = "Player 2 HP: 30/30";
            p2HPText.fontSize = 20;
            p2HPText.color = Color.white;

            // P2 HP Bar
            Slider p2HPBar = CreateHPBar("P2HPBar", p2Area.transform,
                new Vector2(0.3f, 0.75f), new Vector2(0.7f, 0.95f));

            // P2 Hand Panel
            GameObject p2Hand = CreateUIElement("P2HandPanel", p2Area.transform);
            RectTransform p2HandRT = p2Hand.GetComponent<RectTransform>();
            p2HandRT.anchorMin = new Vector2(0, 0);
            p2HandRT.anchorMax = new Vector2(1, 0.7f);
            p2HandRT.offsetMin = Vector2.zero;
            p2HandRT.offsetMax = Vector2.zero;
            HorizontalLayoutGroup p2HLG = p2Hand.AddComponent<HorizontalLayoutGroup>();
            p2HLG.spacing = 10;
            p2HLG.childAlignment = TextAnchor.MiddleCenter;
            p2HLG.childForceExpandWidth = false;
            p2HLG.childForceExpandHeight = false;

            // === MIDDLE AREA: Battlefield ===
            GameObject midArea = CreateUIElement("BattleField", panel.transform);
            RectTransform midAreaRT = midArea.GetComponent<RectTransform>();
            midAreaRT.anchorMin = new Vector2(0, 0.3f);
            midAreaRT.anchorMax = new Vector2(0.82f, 0.75f);
            midAreaRT.offsetMin = new Vector2(10, 0);
            midAreaRT.offsetMax = new Vector2(0, 0);

            // P2 Field slots (top half of middle)
            Transform[] p2FieldSlots = CreateFieldSlots("P2Field", midArea.transform,
                new Vector2(0, 0.55f), new Vector2(1, 1f), false);

            // Divider
            GameObject divider = CreateUIElement("Divider", midArea.transform);
            RectTransform divRT = divider.GetComponent<RectTransform>();
            divRT.anchorMin = new Vector2(0.05f, 0.48f);
            divRT.anchorMax = new Vector2(0.95f, 0.52f);
            divRT.offsetMin = Vector2.zero;
            divRT.offsetMax = Vector2.zero;
            Image divImg = divider.AddComponent<Image>();
            divImg.color = new Color(0.4f, 0.4f, 0.6f, 0.5f);

            // P1 Field slots (bottom half of middle)
            Transform[] p1FieldSlots = CreateFieldSlots("P1Field", midArea.transform,
                new Vector2(0, 0), new Vector2(1, 0.45f), true);

            // === BOTTOM AREA: Player 1 Info ===
            GameObject p1Area = CreateUIElement("P1Area", panel.transform);
            RectTransform p1AreaRT = p1Area.GetComponent<RectTransform>();
            p1AreaRT.anchorMin = new Vector2(0, 0);
            p1AreaRT.anchorMax = new Vector2(0.82f, 0.3f);
            p1AreaRT.offsetMin = new Vector2(10, 10);
            p1AreaRT.offsetMax = Vector2.zero;

            // P1 Hand Panel
            GameObject p1Hand = CreateUIElement("P1HandPanel", p1Area.transform);
            RectTransform p1HandRT = p1Hand.GetComponent<RectTransform>();
            p1HandRT.anchorMin = new Vector2(0, 0.3f);
            p1HandRT.anchorMax = new Vector2(1, 1f);
            p1HandRT.offsetMin = Vector2.zero;
            p1HandRT.offsetMax = Vector2.zero;
            HorizontalLayoutGroup p1HLG = p1Hand.AddComponent<HorizontalLayoutGroup>();
            p1HLG.spacing = 10;
            p1HLG.childAlignment = TextAnchor.MiddleCenter;
            p1HLG.childForceExpandWidth = false;
            p1HLG.childForceExpandHeight = false;

            // P1 HP Text
            GameObject p1HPTextGO = CreateUIElement("P1HPText", p1Area.transform);
            RectTransform p1HPRT = p1HPTextGO.GetComponent<RectTransform>();
            p1HPRT.anchorMin = new Vector2(0, 0);
            p1HPRT.anchorMax = new Vector2(0.3f, 0.3f);
            p1HPRT.offsetMin = Vector2.zero;
            p1HPRT.offsetMax = Vector2.zero;
            TextMeshProUGUI p1HPText = p1HPTextGO.AddComponent<TextMeshProUGUI>();
            p1HPText.text = "Player 1 HP: 30/30";
            p1HPText.fontSize = 20;
            p1HPText.color = Color.white;

            // P1 HP Bar
            Slider p1HPBar = CreateHPBar("P1HPBar", p1Area.transform,
                new Vector2(0.3f, 0.05f), new Vector2(0.7f, 0.25f));

            // === RIGHT SIDEBAR ===
            GameObject sidebar = CreateUIElement("Sidebar", panel.transform);
            RectTransform sidebarRT = sidebar.GetComponent<RectTransform>();
            sidebarRT.anchorMin = new Vector2(0.82f, 0);
            sidebarRT.anchorMax = new Vector2(1, 1);
            sidebarRT.offsetMin = new Vector2(5, 10);
            sidebarRT.offsetMax = new Vector2(-10, -10);
            Image sidebarBg = sidebar.AddComponent<Image>();
            sidebarBg.color = PanelColor;

            // Phase indicator
            GameObject phaseGO = CreateUIElement("PhaseText", sidebar.transform);
            RectTransform phaseRT = phaseGO.GetComponent<RectTransform>();
            phaseRT.anchorMin = new Vector2(0, 0.85f);
            phaseRT.anchorMax = new Vector2(1, 0.95f);
            phaseRT.offsetMin = new Vector2(5, 0);
            phaseRT.offsetMax = new Vector2(-5, 0);
            TextMeshProUGUI phaseText = phaseGO.AddComponent<TextMeshProUGUI>();
            phaseText.text = "Phase: Play";
            phaseText.fontSize = 18;
            phaseText.alignment = TextAlignmentOptions.Center;
            phaseText.color = AccentColor;

            // Turn indicator
            GameObject turnGO = CreateUIElement("TurnText", sidebar.transform);
            RectTransform turnRT = turnGO.GetComponent<RectTransform>();
            turnRT.anchorMin = new Vector2(0, 0.75f);
            turnRT.anchorMax = new Vector2(1, 0.85f);
            turnRT.offsetMin = new Vector2(5, 0);
            turnRT.offsetMax = new Vector2(-5, 0);
            TextMeshProUGUI turnText = turnGO.AddComponent<TextMeshProUGUI>();
            turnText.text = "Player 1's Turn";
            turnText.fontSize = 16;
            turnText.alignment = TextAlignmentOptions.Center;
            turnText.color = Color.white;

            // Deck count
            GameObject deckGO = CreateUIElement("DeckText", sidebar.transform);
            RectTransform deckRT = deckGO.GetComponent<RectTransform>();
            deckRT.anchorMin = new Vector2(0, 0.65f);
            deckRT.anchorMax = new Vector2(1, 0.75f);
            deckRT.offsetMin = new Vector2(5, 0);
            deckRT.offsetMax = new Vector2(-5, 0);
            TextMeshProUGUI deckText = deckGO.AddComponent<TextMeshProUGUI>();
            deckText.text = "Deck: 30";
            deckText.fontSize = 16;
            deckText.alignment = TextAlignmentOptions.Center;
            deckText.color = Color.white;

            // End Turn button
            Button endTurnBtn = CreateStyledButton("EndTurnButton", sidebar.transform, "END TURN",
                new Vector2(0.1f, 0.05f), new Vector2(0.9f, 0.15f), new Color(0.7f, 0.2f, 0.2f, 1f));

            // Store references for wiring
            panel.AddComponent<GameBoardRefs>();
            GameBoardRefs refs = panel.GetComponent<GameBoardRefs>();
            refs.p1HPText = p1HPText;
            refs.p2HPText = p2HPText;
            refs.p1HPBar = p1HPBar;
            refs.p2HPBar = p2HPBar;
            refs.p1HandPanel = p1Hand.transform;
            refs.p2HandPanel = p2Hand.transform;
            refs.p1FieldSlots = p1FieldSlots;
            refs.p2FieldSlots = p2FieldSlots;
            refs.phaseText = phaseText;
            refs.turnText = turnText;
            refs.deckText = deckText;
            refs.endTurnBtn = endTurnBtn;

            return panel;
        }

        private GameObject CreateWinScreenPanel()
        {
            GameObject panel = CreateUIElement("WinScreenPanel", mainCanvas.transform);
            SetFullStretch(panel.GetComponent<RectTransform>());
            Image panelImg = panel.AddComponent<Image>();
            panelImg.color = new Color(0, 0, 0, 0.85f);
            panel.SetActive(false);

            // Winner text
            GameObject winTextGO = CreateUIElement("WinnerText", panel.transform);
            RectTransform winRT = winTextGO.GetComponent<RectTransform>();
            winRT.anchorMin = new Vector2(0.2f, 0.4f);
            winRT.anchorMax = new Vector2(0.8f, 0.7f);
            winRT.offsetMin = Vector2.zero;
            winRT.offsetMax = Vector2.zero;
            TextMeshProUGUI winText = winTextGO.AddComponent<TextMeshProUGUI>();
            winText.text = "PLAYER X WINS!";
            winText.fontSize = 64;
            winText.alignment = TextAlignmentOptions.Center;
            winText.color = Color.yellow;

            // Play Again button
            Button playAgainBtn = CreateStyledButton("PlayAgainButton", panel.transform, "Play Again",
                new Vector2(0.35f, 0.2f), new Vector2(0.65f, 0.32f), new Color(0.2f, 0.5f, 0.2f, 1f));
            playAgainBtn.onClick.AddListener(() =>
            {
                SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
            });

            // Store winner text ref on panel for retrieval
            panel.AddComponent<WinPanelRef>();
            panel.GetComponent<WinPanelRef>().winnerText = winText;

            return panel;
        }

        private void WireEverything(GameObject cardPrefab, GameObject factionPanel, GameObject gamePanel, GameObject winPanel)
        {
            GameBoardRefs refs = gamePanel.GetComponent<GameBoardRefs>();
            WinPanelRef winRef = winPanel.GetComponent<WinPanelRef>();

            // Wire UIManager
            uiManager.player1HPText = refs.p1HPText;
            uiManager.player2HPText = refs.p2HPText;
            uiManager.player1HPBar = refs.p1HPBar;
            uiManager.player2HPBar = refs.p2HPBar;
            uiManager.player1HandPanel = refs.p1HandPanel;
            uiManager.player2HandPanel = refs.p2HandPanel;
            uiManager.player1FieldSlots = refs.p1FieldSlots;
            uiManager.player2FieldSlots = refs.p2FieldSlots;
            uiManager.phaseIndicatorText = refs.phaseText;
            uiManager.turnIndicatorText = refs.turnText;
            uiManager.deckCountText = refs.deckText;
            uiManager.endTurnButton = refs.endTurnBtn;
            uiManager.factionSelectPanel = factionPanel;
            uiManager.winScreenPanel = winPanel;
            uiManager.winnerText = winRef.winnerText;
            uiManager.cardPrefab = cardPrefab;

            // Wire GameManager
            gameManager.uiManager = uiManager;

            // Wire End Turn button
            refs.endTurnBtn.onClick.AddListener(() =>
            {
                playerController.OnEndTurnClicked();
            });

            // Show faction select, hide game panel
            factionPanel.SetActive(true);
            gamePanel.SetActive(true); // game board is visible behind faction select
        }

        // === HELPER METHODS ===

        private GameObject CreateUIElement(string name, Transform parent)
        {
            GameObject go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            return go;
        }

        private void SetFullStretch(RectTransform rt)
        {
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
        }

        private Button CreateFactionButton(string name, Transform parent, string label, Vector2 center, Color color)
        {
            GameObject btnGO = CreateUIElement(name, parent);
            RectTransform btnRT = btnGO.GetComponent<RectTransform>();
            btnRT.anchorMin = new Vector2(center.x - 0.1f, center.y - 0.04f);
            btnRT.anchorMax = new Vector2(center.x + 0.1f, center.y + 0.04f);
            btnRT.offsetMin = Vector2.zero;
            btnRT.offsetMax = Vector2.zero;

            Image btnImg = btnGO.AddComponent<Image>();
            btnImg.color = color;

            Button btn = btnGO.AddComponent<Button>();
            btn.targetGraphic = btnImg;

            GameObject textGO = CreateUIElement("Text", btnGO.transform);
            SetFullStretch(textGO.GetComponent<RectTransform>());
            TextMeshProUGUI text = textGO.AddComponent<TextMeshProUGUI>();
            text.text = label;
            text.fontSize = 22;
            text.alignment = TextAlignmentOptions.Center;
            text.color = Color.white;

            return btn;
        }

        private Button CreateStyledButton(string name, Transform parent, string label, Vector2 anchorMin, Vector2 anchorMax, Color color)
        {
            GameObject btnGO = CreateUIElement(name, parent);
            RectTransform btnRT = btnGO.GetComponent<RectTransform>();
            btnRT.anchorMin = anchorMin;
            btnRT.anchorMax = anchorMax;
            btnRT.offsetMin = Vector2.zero;
            btnRT.offsetMax = Vector2.zero;

            Image btnImg = btnGO.AddComponent<Image>();
            btnImg.color = color;

            Button btn = btnGO.AddComponent<Button>();
            btn.targetGraphic = btnImg;

            GameObject textGO = CreateUIElement("Text", btnGO.transform);
            SetFullStretch(textGO.GetComponent<RectTransform>());
            TextMeshProUGUI text = textGO.AddComponent<TextMeshProUGUI>();
            text.text = label;
            text.fontSize = 22;
            text.alignment = TextAlignmentOptions.Center;
            text.color = Color.white;

            return btn;
        }

        private Slider CreateHPBar(string name, Transform parent, Vector2 anchorMin, Vector2 anchorMax)
        {
            GameObject sliderGO = CreateUIElement(name, parent);
            RectTransform sliderRT = sliderGO.GetComponent<RectTransform>();
            sliderRT.anchorMin = anchorMin;
            sliderRT.anchorMax = anchorMax;
            sliderRT.offsetMin = Vector2.zero;
            sliderRT.offsetMax = Vector2.zero;

            Slider slider = sliderGO.AddComponent<Slider>();
            slider.minValue = 0;
            slider.maxValue = 1;
            slider.value = 1;
            slider.interactable = false;

            // Background
            GameObject bgGO = CreateUIElement("Background", sliderGO.transform);
            SetFullStretch(bgGO.GetComponent<RectTransform>());
            Image bgImg = bgGO.AddComponent<Image>();
            bgImg.color = new Color(0.2f, 0.2f, 0.2f, 1f);

            // Fill area
            GameObject fillArea = CreateUIElement("FillArea", sliderGO.transform);
            SetFullStretch(fillArea.GetComponent<RectTransform>());

            GameObject fill = CreateUIElement("Fill", fillArea.transform);
            SetFullStretch(fill.GetComponent<RectTransform>());
            Image fillImg = fill.AddComponent<Image>();
            fillImg.color = new Color(0.2f, 0.8f, 0.2f, 1f);

            slider.fillRect = fill.GetComponent<RectTransform>();

            return slider;
        }

        private Transform[] CreateFieldSlots(string name, Transform parent, Vector2 anchorMin, Vector2 anchorMax, bool isPlayer1)
        {
            GameObject container = CreateUIElement(name, parent);
            RectTransform containerRT = container.GetComponent<RectTransform>();
            containerRT.anchorMin = anchorMin;
            containerRT.anchorMax = anchorMax;
            containerRT.offsetMin = Vector2.zero;
            containerRT.offsetMax = Vector2.zero;

            HorizontalLayoutGroup hlg = container.AddComponent<HorizontalLayoutGroup>();
            hlg.spacing = 20;
            hlg.childAlignment = TextAnchor.MiddleCenter;
            hlg.childForceExpandWidth = false;
            hlg.childForceExpandHeight = false;
            hlg.padding = new RectOffset(40, 40, 5, 5);

            Transform[] slots = new Transform[3];

            for (int i = 0; i < 3; i++)
            {
                GameObject slot = CreateUIElement("Slot_" + i, container.transform);
                LayoutElement le = slot.AddComponent<LayoutElement>();
                le.preferredWidth = 130;
                le.preferredHeight = 190;

                Image slotImg = slot.AddComponent<Image>();
                slotImg.color = SlotColor;

                // Slot border effect via outline
                Outline outline = slot.AddComponent<Outline>();
                outline.effectColor = SlotBorder;
                outline.effectDistance = new Vector2(2, 2);

                // Slot label
                GameObject labelGO = CreateUIElement("Label", slot.transform);
                SetFullStretch(labelGO.GetComponent<RectTransform>());
                TextMeshProUGUI label = labelGO.AddComponent<TextMeshProUGUI>();
                label.text = "Slot " + (i + 1);
                label.fontSize = 14;
                label.alignment = TextAlignmentOptions.Center;
                label.color = new Color(1, 1, 1, 0.3f);

                // Button for click interaction
                Button slotBtn = slot.AddComponent<Button>();
                slotBtn.targetGraphic = slotImg;
                int slotIndex = i;
                slotBtn.onClick.AddListener(() =>
                {
                    if (playerController != null)
                        playerController.OnFieldSlotClicked(slotIndex);
                });

                slots[i] = slot.transform;
            }

            return slots;
        }
    }

    // Helper component to temporarily store game board references during setup
    public class GameBoardRefs : MonoBehaviour
    {
        public TextMeshProUGUI p1HPText;
        public TextMeshProUGUI p2HPText;
        public Slider p1HPBar;
        public Slider p2HPBar;
        public Transform p1HandPanel;
        public Transform p2HandPanel;
        public Transform[] p1FieldSlots;
        public Transform[] p2FieldSlots;
        public TextMeshProUGUI phaseText;
        public TextMeshProUGUI turnText;
        public TextMeshProUGUI deckText;
        public Button endTurnBtn;
    }

    // Helper to store win panel text reference
    public class WinPanelRef : MonoBehaviour
    {
        public TextMeshProUGUI winnerText;
    }
}
