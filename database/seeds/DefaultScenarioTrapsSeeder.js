'use strict'

/*
|--------------------------------------------------------------------------
| DefaultAdminSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const ScenarioTrap = use('App/Models/ScenarioTrap')
const Database = use('Database')

class DefaultScenarioTrapsSeeder {

  async run() {
    await Database.raw('TRUNCATE scenario_trap CASCADE')
    const scenarioTraps = [
      {
        day: 4,
        message: "Возникла техническая проблема с твоим текущим счётом. Обновить программное обеспечение?",
        yes_lable: 'Да',
        no_lable: 'Нет',
        yes_amount: -10
      },
      {
        day: 6,
        message: "У нас для тебя есть интересная удалённая работа. Зарегистрируйся, оплати 10 V и мы вышлем тебе договор для оформления на работу. Начать регистрацию?",
        yes_lable: 'Да',
        no_lable: 'Нет',
        yes_amount: -50
      },
      {
        day: 7,
        message: "Привет! Это я, Катя, помнишь? Переведи мне 50V, пожалуйста, а то у меня возникла проблема с текущим счётом, надо обновить программное обеспечение на телефоне, а виртуончиков пока не заработала. Переведёшь?",
        yes_lable: 'Да',
        no_lable: 'Нет',
        yes_amount: -50
      },
      {
        day: 9,
        message: "Платёж в 10 V зачислен на текущий счёт через систему Сбербанк.Онлайн",
        action_type: 2,
        yes_lable: 'OK',
        yes_amount: 'next'
      },
      {
        message: "Извини, клала деньги свой подруге, по ошибке перевела тебе. Пожалуйста, верни мне деньги. Переведёшь?",
        yes_lable: 'Да',
        no_lable: 'Нет',
        yes_amount: -10
      },
      {
        day: 11,
        message: "Поздравляем! Вы победитель сегодняшнего конкурса! Подтвердите, что вам исполнилось 18 лет. Вам 18 лет?",
        yes_lable: 'Да',
        no_lable: 'Нет',
        yes_amount: -10
      },
      {
        day: 12,
        message: "Ваш пароль в приложение «Виртуон» сегодня истекает. Отправьте 10V для обновления пароля",
        yes_lable: 'Да',
        no_lable: 'Нет',
        yes_amount: -10
      },
      {
        day: 15,
        message: "Вам пришла открытка от Всеволода. Открыть?",
        yes_lable: 'Да',
        no_lable: 'Нет',
        yes_amount: -10
      },
      {
        day: 17,
        message: "Привет, я видел твое видео на YouTube. Ты знаешь, что тебя снимали? Вот, смотри. Хочешь, я открою?",
        yes_lable: 'Да',
        no_lable: 'Нет',
        yes_amount: -10
      },
      {
        day: 18,
        message: "Уважаемый пользователь мобильного приложения! Ваш номер стал выигрышным! Вы выиграли 500 V! Примите наши поздравления! Чтобы получить денежный приз, нажмите «Да»",
        yes_lable: 'Да',
        no_lable: 'Нет',
        no_amount: 500
      },
    ]

    for (let i = 0; i < scenarioTraps.length; i++) {
      await ScenarioTrap.create({
        name: `Ловушка №${i + 1}`,
        ...scenarioTraps[i],
      })
    }
  }
}

module.exports = DefaultScenarioTrapsSeeder
