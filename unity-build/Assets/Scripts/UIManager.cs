using UnityEngine;
using UnityEngine.UI;

namespace SCPBreach
{
    public class UIManager : MonoBehaviour
    {
        [Header("HP Display")]
        public Text player1HPText;
        public Text player2HPText;
        public Slider player1HPBar;
        public Slider player2HPBar;

        [Header("Hand Display")]
        public Transform player1HandPanel;
        public Transform player2HandPanel;

        [Header("Field Display")]
        public Transform[] player1FieldSlots = new Transform[3];
        public Transform[] player2FieldSlots = new Transform[3];

        [Header("Game Info")]
        public Text phaseIndicatorText;
        public Text turnIndicatorText;
        public Text deckCountText;

        [Header("Buttons")]
        public Button endTurnButton;

        [Header("Screens")]
        public GameObject factionSelectPanel;
        public GameObject winScreenPanel;
        public Text winnerText;

        [Header("Prefabs")]
        public GameObject cardPrefab;

        public void UpdateHP(int player1HP, int player2HP)
        {
            if (player1HPText != null)
                player1HPText.text = "P1 HP: " + player1HP + "/30";
            if (player2HPText != null)
                player2HPText.text = "P2 HP: " + player2HP + "/30";
            if (player1HPBar != null)
                player1HPBar.value = player1HP / 30f;
            if (player2HPBar != null)
                player2HPBar.value = player2HP / 30f;
        }

        public void UpdateHand(PlayerState player, bool isCurrentPlayer)
        {
            Transform handPanel = isCurrentPlayer ?
                (GameManager.Instance.turnManager.currentPlayerIndex == 0 ? player1HandPanel : player2HandPanel) :
                (GameManager.Instance.turnManager.currentPlayerIndex == 0 ? player2HandPanel : player1HandPanel);

            if (handPanel == null)
                return;

            foreach (Transform child in handPanel)
            {
                Destroy(child.gameObject);
            }

            for (int i = 0; i < player.hand.Count; i++)
            {
                if (cardPrefab == null)
                    break;

                GameObject cardObj = Instantiate(cardPrefab, handPanel);
                cardObj.SetActive(true);
                CardUI cardUI = cardObj.GetComponent<CardUI>();
                if (cardUI != null)
                {
                    cardUI.SetupCard(player.hand[i]);
                    int cardIndex = i;
                    Button btn = cardObj.GetComponent<Button>();
                    if (btn != null && isCurrentPlayer)
                    {
                        btn.onClick.AddListener(() =>
                        {
                            FindObjectOfType<PlayerController>().OnCardInHandClicked(cardIndex);
                        });
                    }
                }
            }
        }

        public void UpdateField(PlayerState p1, PlayerState p2)
        {
            UpdateFieldSlots(p1.field, player1FieldSlots);
            UpdateFieldSlots(p2.field, player2FieldSlots);
        }

        private void UpdateFieldSlots(CardInstance[] field, Transform[] slotTransforms)
        {
            if (slotTransforms == null)
                return;

            for (int i = 0; i < 3; i++)
            {
                if (i >= slotTransforms.Length || slotTransforms[i] == null)
                    continue;

                foreach (Transform child in slotTransforms[i])
                {
                    Destroy(child.gameObject);
                }

                if (field[i] != null && cardPrefab != null)
                {
                    GameObject cardObj = Instantiate(cardPrefab, slotTransforms[i]);
                    cardObj.SetActive(true);
                    CardUI cardUI = cardObj.GetComponent<CardUI>();
                    if (cardUI != null)
                    {
                        cardUI.SetupCard(field[i].data);
                        cardUI.UpdateDEF(field[i].currentDEF);
                    }
                }
            }
        }

        public void ShowPhaseIndicator(GamePhase phase)
        {
            if (phaseIndicatorText != null)
                phaseIndicatorText.text = "Phase: " + phase.ToString();

            if (turnIndicatorText != null)
            {
                int playerNum = GameManager.Instance.turnManager.currentPlayerIndex + 1;
                turnIndicatorText.text = "Player " + playerNum + "'s Turn";
            }

            if (endTurnButton != null)
            {
                endTurnButton.interactable = (phase == GamePhase.PlayPhase);
            }
        }

        public void ShowWinScreen(int winnerIndex)
        {
            if (winScreenPanel != null)
                winScreenPanel.SetActive(true);

            if (winnerText != null)
                winnerText.text = "Player " + (winnerIndex + 1) + " Wins!";
        }

        public void ShowFactionSelect()
        {
            if (factionSelectPanel != null)
                factionSelectPanel.SetActive(true);
        }

        public void HideFactionSelect()
        {
            if (factionSelectPanel != null)
                factionSelectPanel.SetActive(false);
        }
    }
}
