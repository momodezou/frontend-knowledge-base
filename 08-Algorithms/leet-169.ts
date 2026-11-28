// 给定一个大小为 n 的数组 nums ，返回其中的多数元素。多数元素是指在数组中出现次数 大于 ⌊ n/2 ⌋ 的元素。
// 你可以假设数组是非空的，并且给定的数组总是存在多数元素。

let majorityElement = function (nums: number[]) {
  const numMap = new Map()
  for (let i = 0; i < nums.length; i++) {
    let curNumCount = numMap.get(nums[i]) || 0
    numMap.set(nums[i], curNumCount + 1)
  }
  return Array.from(numMap.entries()).sort((a, b) => b[1] - a[1])[0][0]
};


// var majorityElement = function(nums) {
//     let ans = 0, hp = 0;
//     for (const x of nums) {
//         if (hp === 0) { // x 是初始擂主，生命值为 1
//             ans = x;
//             hp = 1;
//         } else { // 比武，同门加血，否则扣血
//             hp += x === ans ? 1 : -1;
//         }
//     }
//     return ans;
// };
console.log(majorityElement([3,2,3]));
