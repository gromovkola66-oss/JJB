using UnityEngine;

namespace SCPBreach
{
    public class PlayerController : MonoBehaviour
    {
        private int selectedCardIndex = -1;
        private GameManager gameManager;

        private void Start()
        {
            gameManager = GameManager.Instance;
        }

        private void Update()
        {
            if (gameManager == null || gameManager.gameState == GamePhase.GameOver)
                return;

            if (gameManager.turnManager.currentPhase == GamePhase.FactionSelect)
                return;
        }

        public void OnCardInHandClicked(int cardIndex)
        {
            if (gameManager.turnManager.currentPhase != GamePhase.PlayPhase)
                return;

            if (gameManager.turnManager.hasPlayedCardThisTurn)
                return;

            PlayerState currentPlayer = gameManager.GetCurrentPlayer();

            if (cardIndex < 0 || cardIndex >= currentPlayer.hand.Count)
                return;

            CardData selectedCard = currentPlayer.hand[cardIndex];

            // If it's an item card, apply effect immediately
            if (selectedCard.cardType == CardType.Item)
            {
                PlayItemCard(currentPlayer, selectedCard, cardIndex);
                return;
            }

            // For unit cards, mark as selected (waiting for slot click)
            selectedCardIndex = cardIndex;
        }

        public void OnFieldSlotClicked(int slotIndex)
        {
            if (gameManager.turnManager.currentPhase != GamePhase.PlayPhase)
                return;

            if (gameManager.turnManager.hasPlayedCardThisTurn)
                return;

            if (selectedCardIndex < 0)
                return;

            PlayerState currentPlayer = gameManager.GetCurrentPlayer();

            if (slotIndex < 0 || slotIndex >= currentPlayer.field.Length)
                return;

            // Check if slot is empty
            if (currentPlayer.field[slotIndex] != null)
                return;

            CardData cardToPlay = currentPlayer.hand[selectedCardIndex];

            // Only unit cards go on the field
            if (cardToPlay.cardType != CardType.Unit)
                return;

            // Place card on field
            currentPlayer.field[slotIndex] = new CardInstance(cardToPlay);
            currentPlayer.hand.RemoveAt(selectedCardIndex);
            gameManager.turnManager.hasPlayedCardThisTurn = true;
            selectedCardIndex = -1;

            // Update UI
            gameManager.UpdateUI();
        }

        public void OnEndTurnClicked()
        {
            if (gameManager.turnManager.currentPhase == GamePhase.GameOver)
                return;

            if (gameManager.turnManager.currentPhase == GamePhase.FactionSelect)
                return;

            gameManager.turnManager.NextPhase();
            gameManager.UpdateUI();
        }

        private void PlayItemCard(PlayerState currentPlayer, CardData item, int handIndex)
        {
            PlayerState opponent = gameManager.GetOpponentPlayer();

            gameManager.battleSystem.ApplyItemEffect(item, currentPlayer, opponent);
            currentPlayer.hand.RemoveAt(handIndex);
            currentPlayer.discardPile.Add(item);
            gameManager.turnManager.hasPlayedCardThisTurn = true;
            selectedCardIndex = -1;

            // Check win conditions after item effect
            gameManager.CheckWinCondition();
            gameManager.UpdateUI();
        }

        public int GetSelectedCardIndex()
        {
            return selectedCardIndex;
        }

        public void ClearSelection()
        {
            selectedCardIndex = -1;
        }
    }
}
