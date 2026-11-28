// 给定一个数组 prices ，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。
// 你只能选择 某一天 买入这只股票，并选择在 未来的某一个不同的日子 卖出该股票。设计一个算法来计算你所能获取的最大利润。
// 返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 0 。

/**
 * @param {number[]} prices
 * @return {number}
 */
let maxProfit1 = function (prices: number[]) {
  // let profit = 0
  // for (let i = 0; i < prices.length - 1; i++) {
  //   let buy = prices[i]
  //   for (let j = i + 1; j < prices.length; j++) {
  //     let sell = prices[j]
  //     profit = Math.max(profit, sell - buy)
  //   }
  // }
  // return profit

  let profit = 0
  let minPrice = prices[0]
  for (let i = 1; i < prices.length; i++) {
    profit = Math.max(profit, prices[i] - minPrice)
    minPrice = Math.min(minPrice, prices[i])
  }

  return profit
};

console.log(maxProfit1([7, 1, 5, 3, 6, 4]));
