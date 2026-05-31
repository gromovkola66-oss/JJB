namespace SCPBreach
{
    [System.Serializable]
    public class CardInstance
    {
        public CardData data;
        public int currentDEF;
        public bool hasAttackedThisTurn;

        public CardInstance(CardData cardData)
        {
            data = cardData;
            currentDEF = cardData.defense;
            hasAttackedThisTurn = false;
        }

        public bool IsDestroyed()
        {
            return currentDEF <= 0;
        }

        public void TakeDamage(int damage)
        {
            currentDEF -= damage;
        }

        public void ResetAttackFlag()
        {
            hasAttackedThisTurn = false;
        }
    }
}
