console.log('inject.js run');

function testTips() {
    for (let i = 0; i < 1000; i++) {
        tips(true, "ceshi " + (i + 1));
    }
}