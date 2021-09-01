export const sumArrayNumber = (array) => {
    return array.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};

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
