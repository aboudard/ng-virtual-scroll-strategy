import { Item } from '../dto/item';

const Padding = 3 * 2;
const Title = 18;
const MarginP = 18 * 2;
const MessageRowHeight = 18;
const MessageRowCharCount = 55;
const Border = 1;

export const itemHeightPredictor = (m: Item) => {
  const textHeight =
    Math.ceil(m.text.length / MessageRowCharCount) * MessageRowHeight;
    console.log('texte : ', m.text);
    console.log('texte height : ', textHeight);
    console.log('total : ', Padding + Title + MarginP + textHeight + Border)
  return (Padding + Title + MarginP + textHeight + Border);
};
