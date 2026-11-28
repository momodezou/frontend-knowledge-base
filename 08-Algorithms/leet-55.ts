// 给你一个非负整数数组 nums ，你最初位于数组的 第一个下标 。数组中的每个元素代表你在该位置可以跳跃的最大长度。
// 判断你是否能够到达最后一个下标，如果可以，返回 true ；否则，返回 false 。


// 如果从所有下标处起跳都无法到达最后一个下标，则返回false,即：存在i+ nums[i]>number.length-1则返回true
// https://leetcode.cn/problems/jump-game/solutions/2798996/liang-chong-li-jie-fang-shi-wei-hu-zui-y-q67s/?envType=study-plan-v2&envId=top-interview-150
/**
* @param {number[]} nums
* @return {boolean}
*/
var canJump = function (nums: number[]) {
  let max = 0
  for (let i = 0; i < nums.length; i++) {
    if (i > max) {
      return false
    }
    max = Math.max(max, i + nums[i])
  }
  return true
};
console.log(canJump([3,2,1,0,4]));
// console.log(canJump([2, 3, 1, 1, 4]));
