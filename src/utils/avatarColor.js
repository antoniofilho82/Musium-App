// Cores usadas para gerar avatar colorido com base no usuário
// Garante que o mesmo usuário sempre tenha a mesma cor de avatar
const colors = [
  '#1DB954',
  '#ff6b81',
  '#6effa2',
  '#ffaf40',
  '#7c4dff',
  '#00bcd4',
  '#f06292',
];

// Calcula uma cor estável para o avatar a partir do valor do usuário
// Usa hash do email/nome para garantir consistência entre sessões
export const getUserAvatarColor = (value = '') => {
  const hash = [...value].reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return colors[Math.abs(hash) % colors.length];
};
