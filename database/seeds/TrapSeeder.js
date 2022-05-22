'use strict'

/*
|--------------------------------------------------------------------------
| TrapSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Database = use('Database')
const Trap = use('App/Models/Trap')

class TrapSeeder {
  async run() {
    const traps = [
      {
        message: [
          {
            text: 'Возникла техническая проблема с твоим текущим счётом. Обновить программное обеспечение?',
            actions: [
              {
                value: 'yes',
                label: 'Да',
              },
              {
                value: 'no',
                label: 'Нет',
              }
            ],
          },
        ],
        penalty: 10,
      },
      {
        message: [
          {
            text: 'У нас для тебя есть интересная удалённая работа. Зарегистрируйся, оплати 10 V и мы вышлем тебе договор для оформления на работу. Начать регистрацию?',
            actions: [
              {
                value: 'yes',
                label: 'Да',
              },
              {
                value: 'no',
                label: 'Нет',
              }
            ],
          },
        ],
        penalty: 50,
      },
      {
        message: [
          {
            text: 'Привет! Это я, Катя, помнишь? Переведи мне 50V, пожалуйста, а то у меня возникла проблема с текущим счётом, надо обновить программное обеспечение на телефоне, а виртуончиков пока не заработала. Переведёшь?',
            actions: [
              {
                value: 'yes',
                label: 'Да',
              },
              {
                value: 'no',
                label: 'Нет',
              }
            ],
          },
        ],
        penalty: 50,
      },
      {
        message: [
          {
            text: 'Платёж в 10 V зачислен на текущий счёт через систему Сбербанк.Онлайн',
            actions: [
              {
                value: 'next',
                label: 'OK',
              }
            ],
          },
          {
            label: 'next',
            text: 'Извини, клала деньги свой подруге, по ошибке перевела тебе. Пожалуйста, верни мне деньги. Переведёшь?',
            actions: [
              {
                value: 'yes',
                label: 'Да',
              },
              {
                value: 'no',
                label: 'Нет',
              }
            ],
          }
        ],
        penalty: 10,
      },
      {
        message: [
          {
            text: 'Поздравляем! Вы победитель сегодняшнего конкурса! Подтвердите, что вам исполнилось 18 лет. Вам 18 лет?',
            actions: [
              {
                value: 'yes',
                label: 'Да',
              },
              {
                value: 'no',
                label: 'Нет',
              }
            ],
          },
        ],
        penalty: 10,
      },
      {
        message: [
          {
            text: 'Ваш пароль в приложение «Виртуон» сегодня истекает. Отправьте 10V для обновления пароля',
            actions: [
              {
                value: 'yes',
                label: 'Да',
              },
              {
                value: 'no',
                label: 'Нет',
              }
            ],
          },
        ],
        penalty: 10,
      },
      {
        message: [
          {
            text: 'Вам пришла открытка от Всеволода. Открыть?',
            actions: [
              {
                value: 'yes',
                label: 'Да',
              },
              {
                value: 'no',
                label: 'Нет',
              }
            ],
          },
        ],
        penalty: 5,
      },
      {
        message: [
          {
            text: 'Уважаемый пользователь мобильного приложения! Ваш номер стал выигрышным! Вы выиграли 500 V! Примите наши поздравления! Чтобы получить денежный приз, нажмите «Да»',
            actions: [
              {
                value: 'yes',
                label: 'Да',
              },
              {
                value: 'no',
                label: 'Нет',
              }
            ],
          },
        ],
        reward: 500,
      },
      {
        message: [
          {
            text: 'Возникла техническая проблема с твоим текущим счётом. Обновить программное обеспечение?',
            actions: [
              {
                value: 'yes',
                label: 'Да',
              },
              {
                value: 'no',
                label: 'Нет',
              }
            ],
          },
        ],
        penalty: 10,
      },
    ]

    await Database.transaction(async transaction => {
      await Trap.query(transaction)
        .truncate()

      for (let i = 0; i < traps.length; i++) {
        traps[i].message = JSON.stringify(traps[i].message)
        await Trap.create({
          name: `Ловушка №${i + 1}`,
          ...traps[i],
        }, transaction)
      }
    })
  }
}

module.exports = TrapSeeder
