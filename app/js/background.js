console.log('background.js run');


/**
 * 获取随机数
 * @param min 最小值
 * @param max 最大值
 */
function getRandom(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

/**
 * 延迟执行函数
 * @param fn 要执行的函数
 * @param delay 延迟的最小秒数
 */
function dosthDelay(fn, delay) {
    delay = (delay || 3) * 1000;
    let sec = getRandom(delay, delay + 3000);
    console.log(sec);
    setTimeout(fn, sec);
}

for (let i = 0; i < 10; i++) {
    dosthDelay(function () {
        console.log('xxx');
    });
}