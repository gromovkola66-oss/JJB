using UnityEngine;
using UnityEngine.UI;

namespace SCPBreach
{
    public class FactionSelectUI : MonoBehaviour
    {
        [Header("Player 1 Buttons")]
        public Button p1MOGButton;
        public Button p1ChaosButton;
        public Button p1GOCButton;

        [Header("Player 2 Buttons")]
        public Button p2MOGButton;
        public Button p2ChaosButton;
        public Button p2GOCButton;

        [Header("Start Button")]
        public Button startGameButton;

        [Header("Selection Indicators")]
        public Text p1SelectionText;
        public Text p2SelectionText;

        private Faction? player1Selection = null;
        private Faction? player2Selection = null;

        private void Start()
        {
            if (startGameButton != null)
            {
                startGameButton.interactable = false;
                startGameButton.onClick.AddListener(OnStartGameClicked);
            }

            if (p1MOGButton != null)
                p1MOGButton.onClick.AddListener(() => SelectFactionP1(Faction.MOG));
            if (p1ChaosButton != null)
                p1ChaosButton.onClick.AddListener(() => SelectFactionP1(Faction.Chaos));
            if (p1GOCButton != null)
                p1GOCButton.onClick.AddListener(() => SelectFactionP1(Faction.GOC));

            if (p2MOGButton != null)
                p2MOGButton.onClick.AddListener(() => SelectFactionP2(Faction.MOG));
            if (p2ChaosButton != null)
                p2ChaosButton.onClick.AddListener(() => SelectFactionP2(Faction.Chaos));
            if (p2GOCButton != null)
                p2GOCButton.onClick.AddListener(() => SelectFactionP2(Faction.GOC));
        }

        private void SelectFactionP1(Faction faction)
        {
            player1Selection = faction;
            if (p1SelectionText != null)
                p1SelectionText.text = "P1: " + faction.ToString();
            CheckStartButton();
        }

        private void SelectFactionP2(Faction faction)
        {
            player2Selection = faction;
            if (p2SelectionText != null)
                p2SelectionText.text = "P2: " + faction.ToString();
            CheckStartButton();
        }

        private void CheckStartButton()
        {
            bool bothSelected = player1Selection.HasValue && player2Selection.HasValue;
            if (startGameButton != null)
                startGameButton.interactable = bothSelected;
        }

        private void OnStartGameClicked()
        {
            if (!player1Selection.HasValue || !player2Selection.HasValue)
                return;

            GameManager.Instance.StartGame(player1Selection.Value, player2Selection.Value);
        }
    }
}
