using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace SCPBreach
{
    public class CardUI : MonoBehaviour
    {
        public TextMeshProUGUI nameText;
        public TextMeshProUGUI atkText;
        public TextMeshProUGUI defText;
        public Image background;

        // Faction colors
        private static readonly Color MOGColor = new Color(0.2f, 0.4f, 0.8f, 1f);       // Blue
        private static readonly Color ChaosColor = new Color(0.8f, 0.2f, 0.2f, 1f);     // Red
        private static readonly Color GOCColor = new Color(0.2f, 0.7f, 0.3f, 1f);       // Green
        private static readonly Color ItemColor = new Color(0.9f, 0.75f, 0.1f, 1f);     // Gold/Yellow

        public void SetupCard(CardData data)
        {
            if (data == null)
                return;

            if (nameText != null)
                nameText.text = data.cardName;

            if (atkText != null)
                atkText.text = "ATK: " + data.attack.ToString();

            if (defText != null)
                defText.text = "DEF: " + data.defense.ToString();

            // Set background color based on faction/type
            if (background != null)
            {
                if (data.cardType == CardType.Item)
                {
                    background.color = ItemColor;
                }
                else
                {
                    switch (data.faction)
                    {
                        case Faction.MOG:
                            background.color = MOGColor;
                            break;
                        case Faction.Chaos:
                            background.color = ChaosColor;
                            break;
                        case Faction.GOC:
                            background.color = GOCColor;
                            break;
                    }
                }
            }
        }

        public void UpdateDEF(int currentDEF)
        {
            if (defText != null)
                defText.text = "DEF: " + currentDEF.ToString();
        }
    }
}
