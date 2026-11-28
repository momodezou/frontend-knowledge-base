// 给定一个整数数组 nums，将数组中的元素向右轮转 k 个位置，其中 k 是非负数。
// https://leetcode.cn/problems/rotate-array/description/?envType=study-plan-v2&envId=top-interview-150

/**
 * @param {number[]} nums
 * @param {number} k
 * @return {void} Do not return anything, modify nums in-place instead.
 */
let rotate = function (nums: number[], k: number) {
  const newArr = new Array(nums.length)
  for (let i = 0; i < nums.length; i++) {
    newArr[(i + k) % nums.length] = nums[i]
  }
  for (let i = 0; i < nums.length; i++) {
    nums[i] = newArr[i]
  }
  return nums
};

console.log(rotate([-1, -100, 3, 99], 2));
