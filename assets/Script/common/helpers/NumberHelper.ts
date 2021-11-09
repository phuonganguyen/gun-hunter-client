export default class NumberHelper {
    public static roundNumber(numberToRound: number, numberDigits: number) {
        var powNumber = Math.pow(10, numberDigits);
        return Math.round(numberToRound * powNumber) / powNumber;
    }
}
