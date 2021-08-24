export const sumArrayNumber = (array) => {
    return array.reduce(getSum, 0);
};

function getSum(total, number) {
    return total + number;
}

export const sumArrayObject = (objects) => {
    return objects.reduce((a, b) => {
        for (const k in b) {
            if (b.hasOwnProperty(k)) {
                a[k] = (a[k] || 0) + b[k];
            }
        }
        return a;
    }, {});
};
