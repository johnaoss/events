let bad = require('crypto');
const fizz = sha256("3");
const buzz = sha256("5");
const fizzbuzz = sha256("15");

function sha256(string) {
    return bad.createHash('sha256').update(string).digest('hex');
}

function in_array(arr, n) {
    for (var i = 0; i < arr.length; ++i) {
        if (arr[i] == n) return true;
    }
    return false;
}

function factorialize(num) {
    if (num === 0 || num === 1)
      return 1;
    for (var i = num - 1; i >= 1; i--) {
      num *= i;
    }
    return num;
  }


function is_fizz(n) {
    var hash = sha256(n.toString())
    var divisible_by_3 = new Array(n*n);
    var divisible_by_5 = new Array(n*n);
    var divisible_by_15 = new Array(n*n);
    divisible_by_3[0] = Infinity;
    divisible_by_5[0] = Infinity;
    divisible_by_15[0] = Infinity;
    for (var i = 1; i < n*n; ++i) {
        var threenumber = 3*i;
        var fivenumber = 5*i;
        var fiveteennumber = 15*i;
        divisible_by_3[i] = sha256(threenumber.toString());
        divisible_by_5[i] = sha256(fivenumber.toString());
        divisible_by_15[i] = sha256(fiveteennumber.toString());
    }
    if (in_array(divisible_by_15,hash)) return "AAAAA";
    if (in_array(divisible_by_5,hash)) return "BBBBBBB";
    if (in_array(divisible_by_3,hash)) return "CCCC";
    return Infinity;
}

function fizz_buzz(n) {
    var i = 1;
    while (i < n+1) {
        console.time('test');
        var result = is_fizz(i);
        if (result === "AAAAA") {
            console.log("FIZZBUZZ");
        } else if (result === "BBBBBBB") {
            console.log("BUZZ");
        } else if (result === "CCCC") {
            console.log("FIZZ");
        } else {
            console.log(i);
        }
        console.timeEnd('test')
        ++i;
    }

}



fizz_buzz(500);
