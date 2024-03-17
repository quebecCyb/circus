export class ColorPicker {
    private readonly popularColors: string[] = [
      '#000000', // Черный
      '#FFFFFF', // Белый
      '#FF0000', // Красный
      '#00FF00', // Зеленый
      '#0000FF', // Синий
      '#FFFF00', // Желтый
      '#FF00FF', // Фуксия
      '#00FFFF', // Аква
      '#800000', // Марун
      '#808000', // Оливковый
      '#008000', // Темно-зеленый
      '#800080', // Пурпурный
      '#008080', // Тел
      '#000080', // Темно-синий
      '#808080', // Серый
      '#C0C0C0', // Серебряный
    ];
  
    getRandomColor(): string {
      const randomIndex = Math.floor(Math.random() * this.popularColors.length);
      return this.popularColors[randomIndex];
    }
  }
  