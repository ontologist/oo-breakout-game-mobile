function drawPlayer(ctx, x, y, radius) {
  // Draw the avatar head
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "#FFEE58";
  ctx.fill();
  ctx.strokeStyle = "red";
  ctx.stroke();
  ctx.closePath();

  // Left eye
  ctx.beginPath();
  ctx.arc(x - 3, y - 2, 2, 0, 2 * Math.PI);
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.closePath();

  // Right eye
  ctx.beginPath();
  ctx.arc(x + 3, y - 2, 2, 0, 2 * Math.PI);
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.closePath();

  // Mouth
  ctx.beginPath();
  ctx.arc(x, y + 2, 5, 0, Math.PI);
  ctx.strokeStyle = "red";
  ctx.stroke();
  ctx.closePath();
} 