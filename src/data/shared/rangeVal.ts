class RangeVal {
    min: number;
    max: number;

    constructor(min: number, max: number) {
        this.min = min;
        this.max = max;
    }

    IsNumberInRange = (value: number): boolean => {
        if (value < this.min) {
            return false;
        }

        if (value > this.max) {
            return false;
        }

        return true;
    }

    IsStringInRange = (value: string): boolean => {
        if (value.length < this.min) {
            return false;
        }

        if (value.length > this.max) {
            return false;
        }

        return true;
    }
}

export default RangeVal;