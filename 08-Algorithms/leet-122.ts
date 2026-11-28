// 给你一个整数数组 prices ，其中 prices[i] 表示某支股票第 i 天的价格。
// 在每一天，你可以决定是否购买和/或出售股票。你在任何时候 最多 只能持有 一股 股票。然而，你可以在 同一天 多次买卖该股票，但要确保你持有的股票不超过一股。
// 返回 你能获得的 最大 利润 。
// https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/description/?envType=study-plan-v2&envId=top-interview-150

/**
 * @param {number[]} prices
 * @return {number}
 */
let maxProfit2 = (prices: number[]) => {
  let profit = 0
  let left = 0
  let right = 1

  while (right < prices.length) {
    if (prices[right] > prices[left]) {
      profit += prices[right] - prices[left]
    }
    left = right
    right++
  }

  return profit
};

console.log(maxProfit2([7,6,4,3,1]));
// console.log(maxProfit2([1,2,3,4,5]));
// console.log(maxProfit2([7,1,5,3,6,4]));
