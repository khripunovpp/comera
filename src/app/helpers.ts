export class Helpers {
  // Функция для вычисления среднего значения массива
  static calculateMean(
    array: number[]
  ) {
    let sum = array.reduce((acc, val) => acc + val, 0);
    return sum / array.length;
  }

// Функция для вычисления стандартного отклонения массива
  static calculateStdDeviation(
    array: number[],
    mean: number
  ) {
    let variance = array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / array.length;
    return Math.sqrt(variance);
  }
}
