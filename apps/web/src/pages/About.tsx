import './About.css'

export function AboutPage() {
  return (
    <section className="about-page section">
      <div className="container about-page__grid">
        <div>
          <p className="eyebrow">О сервисе</p>
          <h1 className="about-page__title">AutoDoc — ремонт без визита в бокс</h1>
        </div>
        <div className="about-page__copy">
          <p>
            Мы приезжаем по адресу клиента, забираем автомобиль в наш сервис и при
            необходимости оставляем временную машину. Пока идёт ремонт, вы ездите на
            подменной. Когда авто готово — возвращаем его и забираем временную.
          </p>
          <p>
            Команда AutoDoc работает с легковыми авто в Москве и области. Статусы
            заявок, контакты и согласование слота — в личном кабинете после входа
            через Telegram.
          </p>
          <ul className="about-page__list">
            <li>Подача и возврат по адресу</li>
            <li>Временная машина по запросу</li>
            <li>Прозрачные статусы заявки</li>
            <li>Каталог услуг с ориентиром по цене</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
