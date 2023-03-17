import axios from 'axios';
import MD5 from 'crypto-js/md5';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.locale('ru');
dayjs.extend(customParseFormat);

const tts = axios.create({
  baseURL: 'https://api.tgt72.ru/api/v5',
  transformResponse: [(data) => {
    try {
      // eslint-disable-next-line no-param-reassign
      data = JSON.parse(data);
    } catch {
      return { error: true, message: 'Возможно, номер карты введет неправильно или же ведутся технические работы на сервере. Также не исключено, что карта заблокирована.', details: data };
    }

    if (data.card) {
      const card = {
        id: data.card,
        type: data.ltype,
        date: data.date,
        balance: data.balance
          .toFixed(2)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ' '),

        exemption: {
          balance: data.exemption_balance,
          limit: data.exemption_limit,
        },

        history: data.history.map((item) => {
          const isTravel = !item.agent.match(/ТТС/);

          return {
            ...item,

            routeNumber: item.route.split('.')[0],
            routeName: item.route.replace(`${item.route.split('.')[0]}.`, '').trim(),
            isTravel,
            parsedSum: `${isTravel ? '-' : '+'}${item.sum.toFixed(2)} ₽`,
            parsedDate: dayjs(item.date, 'DD.MM.YY hh:mm:ss')
              .locale('ru')
              .format('DD MMMM в HH:mm'),

          };
        }).reverse(),

        raw: data,
      };
      return card;
    }
    return data;
  }],
});

export const getCard = (id) => {
  const hash = MD5(`${dayjs().format('DD.MM.YYYY')}.${id}`).toString();
  return tts.get('/balance', { params: { card: id, hash } });
};

export const getNews = (limit = 15) => tts.get('/news', { params: { limit } });
