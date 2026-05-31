using System.Collections.Generic;

namespace SCPBreach
{
    [System.Serializable]
    public class PlayerState
    {
        public int hp = 30;
        public int maxHp = 30;
        public Faction faction;
        public List<CardData> deck = new List<CardData>();
        public List<CardData> hand = new List<CardData>();
        public CardInstance[] field = new CardInstance[3];
        public List<CardData> discardPile = new List<CardData>();
        public bool skipNextBattle;

        public void TakeDamage(int damage)
        {
            hp -= damage;
            if (hp < 0)
                hp = 0;
        }

        public void HealHP(int amount)
        {
            hp += amount;
            if (hp > maxHp)
                hp = maxHp;
        }

        public bool IsAlive()
        {
            return hp > 0;
        }

        public CardData DrawCard()
        {
            if (deck.Count == 0)
                return null;

            CardData card = deck[0];
            deck.RemoveAt(0);
            hand.Add(card);
            return card;
        }

        public int GetFieldCardCount()
        {
            int count = 0;
            for (int i = 0; i < field.Length; i++)
            {
                if (field[i] != null)
                    count++;
            }
            return count;
        }

        public int GetFirstEmptySlot()
        {
            for (int i = 0; i < field.Length; i++)
            {
                if (field[i] == null)
                    return i;
            }
            return -1;
        }
    }
}
