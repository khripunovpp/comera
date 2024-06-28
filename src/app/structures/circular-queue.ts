export class CircularQueue<T = number> {
  constructor(
    size: number // Размер очереди
  ) {
    this.queue = new Array(size); // Инициализируем массив фиксированного размера
    this.size = size; // Сохраняем размер очереди
  }

  head = 0; // Указатель на начало очереди (голова)
  tail = 0; // Указатель на конец очереди (хвост)
  length = 0; // Текущая длина очереди
  queue: T[]; // Массив для хранения элементов очереди
  size: number; // Размер очереди

  enqueue(
    element: any // Элемент для добавления в очередь
  ) {
    this.queue[this.tail] = element; // Добавляем элемент в позицию, на которую указывает tail
    this.tail = (this.tail + 1) % this.size; // Обновляем tail, передвигая его вперед и учитывая, что очередь циклическая
    if (this.length < this.size) {
      this.length++; // Увеличиваем длину, если она еще не достигла максимального размера
    } else {
      this.head = (this.head + 1) % this.size; // Если очередь полная, передвигаем head вперед
    }
    return this
  }

  getQueue() {
    let result = []; // Создаем пустой массив для результата
    for (let i = 0; i < this.length; i++) {
      result.push(this.queue[(this.head + i) % this.size]); // Добавляем элементы в результат, начиная с head
    }
    return result; // Возвращаем массив с элементами очереди в правильном порядке
  }

  last() {
    return this.queue[this.tail - 1];
  }
}
