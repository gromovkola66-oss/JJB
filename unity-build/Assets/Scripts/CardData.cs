using UnityEngine;

namespace SCPBreach
{
    [CreateAssetMenu(fileName = "NewCard", menuName = "SCP Breach/Card Data")]
    public class CardData : ScriptableObject
    {
        public string cardName;
        public Faction faction;
        public CardType cardType;
        public int attack;
        public int defense;
        [TextArea(2, 4)]
        public string description;
        public ItemEffect itemEffect = ItemEffect.None;
    }
}
