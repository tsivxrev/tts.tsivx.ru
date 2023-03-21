<script setup>
import { onMounted, reactive } from 'vue';
import { vgetCard } from './tts';

const state = reactive({
  status: 'ok',
  currentTimeout: 0,
  cardNumber: localStorage.getItem('card_number') || null,

  card: {},
  error: {},
});

const fetchCard = async () => {
  if (!state.cardNumber) return;

  state.card = {};
  state.error = {};
  state.status = 'loading';

  try {
    const card = await vgetCard(state.cardNumber);
    state.card = card;
    state.status = 'ok';
    localStorage.setItem('card_number', card.id);
  } catch (error) {
    state.error = {
      title: error.title,
      message: error.message,
      details: error.details,
    };
    state.status = 'error';
  }
};

const onInput = () => {
  if (!/(\d{19})/.test(state.cardNumber)) return;

  clearTimeout(state.currentTimeout);
  state.currentTimeout = setTimeout(async () => { fetchCard(); }, 1000);
};

onMounted(() => { fetchCard(); });

window.state = state;
</script>

<template>
  <div class="view h-full w-full max-w-md flex flex-col gap-4 items-center p-4 overflow-scroll">
    <div class="header flex flex-col">
      <div class="title">Мой ТТС</div>
      <div class="subtitle">Просмотр баланса транспортной карты Тюменской области (ТТС)</div>
    </div>

    <div class="card-number w-full flex flex-col rounded-md">
      <label>Номер карты</label>
      <input
        @input="onInput"
        v-model="state.cardNumber"
        type="text"
        placeholder="9990057230080149643"
      >
    </div>

    <div v-if="state.status === 'loading'" class="spinner w-full max-w-xl flex flex-col items-center">
      <svg class="text-neutral-600 animate-spin" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path clip-rule="evenodd" d="M16.394 5.077A8.2 8.2 0 0 0 4.58 15.49a.9.9 0 0 1-1.628.767A10 10 0 1 1 12 22a.9.9 0 0 1 0-1.8 8.2 8.2 0 0 0 4.394-15.123z" fill="currentColor" fill-rule="evenodd"/>
      </svg>
    </div>

    <div v-if="state.status === 'error'" class="error w-full rounded-md text-white bg-neutral-800 p-4 flex flex-col">
      <div class="title">{{ state.error.title || "Что-то пошло не так :(" }}</div>
      <div class="subtitle">{{ state.error.message }}</div>
      <div class="details font-mono text-sm text-neutral-500">{{ state.error.details }}</div>
      <div class="actions mt-2 flex gap-2">
        <a @click="fetchCard" class="button bg-neutral-700">
          <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <g id="Page-2" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="replay_24">
                  <polygon id="Shape" points="0 0 24 0 24 24 0 24"></polygon>
                  <path d="M12,5 C16.418278,5 20,8.581722 20,13 C20,17.418278 16.418278,21 12,21 C7.581722,21 4,17.418278 4,13 C4,12.4477153 4.44771525,12 5,12 C5.55228475,12 6,12.4477153 6,13 C6,16.3137085 8.6862915,19 12,19 C15.3137085,19 18,16.3137085 18,13 C18,9.6862915 15.3137085,7 12,7 L12,10.0957793 C12,10.1952857 11.9629113,10.2912196 11.895976,10.3648484 C11.7473732,10.5283115 11.4943939,10.5403581 11.3309309,10.3917553 L7.04262272,6.49329338 C7.02697148,6.47906498 7.01200627,6.46409977 6.99777787,6.44844853 C6.75010658,6.17601012 6.77018431,5.7543779 7.04262272,5.50670662 L11.3309309,1.60824468 C11.4045596,1.54130941 11.5004936,1.5042207 11.6,1.5042207 C11.8209139,1.5042207 12,1.68330681 12,1.90422072 L12,5 Z" id="Mask" fill="currentColor"></path>
                </g>
            </g>
          </svg>
          <div class="caption">Повторить</div>
        </a>
      </div>
    </div>

    <div v-if="state.card.id" class="card w-full flex flex-col gap-2 rounded-md p-4 bg-neutral-800">
      <div class="main flex flex-col">
        <div class="card-type font-medium text-white">Карта «{{ state.card.type }}»</div>
        <div class="card-balance font-bold text-2xl my-1 text-green-500">{{ state.card.balance }} ₽</div>
        <div class="card-number text-sm text-neutral-500">{{ state.card.id }}</div>
        <div class="card-updated text-sm text-neutral-500">Обновлено: {{ state.card.updated_at }}</div>
      </div>

      <div class="actions flex gap-2">
        <a @click="fetchCard" class="option refresh text-white font-medium flex gap-1 bg-neutral-700 rounded-md py-2 px-4 w-full justify-center cursor-pointer hover:bg-green-500 transition duration-300">
          <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <g id="Page-2" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="replay_24">
                  <polygon id="Shape" points="0 0 24 0 24 24 0 24"></polygon>
                  <path d="M12,5 C16.418278,5 20,8.581722 20,13 C20,17.418278 16.418278,21 12,21 C7.581722,21 4,17.418278 4,13 C4,12.4477153 4.44771525,12 5,12 C5.55228475,12 6,12.4477153 6,13 C6,16.3137085 8.6862915,19 12,19 C15.3137085,19 18,16.3137085 18,13 C18,9.6862915 15.3137085,7 12,7 L12,10.0957793 C12,10.1952857 11.9629113,10.2912196 11.895976,10.3648484 C11.7473732,10.5283115 11.4943939,10.5403581 11.3309309,10.3917553 L7.04262272,6.49329338 C7.02697148,6.47906498 7.01200627,6.46409977 6.99777787,6.44844853 C6.75010658,6.17601012 6.77018431,5.7543779 7.04262272,5.50670662 L11.3309309,1.60824468 C11.4045596,1.54130941 11.5004936,1.5042207 11.6,1.5042207 C11.8209139,1.5042207 12,1.68330681 12,1.90422072 L12,5 Z" id="Mask" fill="currentColor"></path>
                </g>
            </g>
          </svg>
          <div class="caption">Обновить</div>
        </a>
        <a :href="`https://tmn.pay2way.ru/tcard/?c=${state.card.id}`" target="_blank" class="option pay text-white font-medium flex gap-1 bg-neutral-700 rounded-md py-2 px-4 w-full justify-center cursor-pointer hover:bg-green-500 transition duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.795 3.1c1.152 0 1.74.113 2.35.44.565.302 1.013.75 1.315 1.314.301.565.421 1.108.438 2.095l.002.256V12a.9.9 0 0 1-1.793.113L20.1 12l-.001-3.1h-16.2l.001 5.895c0 .88.06 1.187.228 1.502.134.25.325.441.575.575.29.156.574.218 1.309.227l.193.001h12.622l-1.463-1.464a.9.9 0 0 1-.081-1.18l.08-.092a.9.9 0 0 1 1.181-.081l.092.08 3 3a.9.9 0 0 1 .08 1.181l-.08.092-3 3a.9.9 0 0 1-1.353-1.18l.08-.092 1.464-1.464H6.205c-1.063 0-1.646-.097-2.21-.369l-.14-.071a3.172 3.172 0 0 1-1.315-1.315c-.301-.564-.421-1.107-.438-2.094l-.002-.256v-7.59c0-1.152.113-1.74.44-2.35A3.171 3.171 0 0 1 3.854 3.54c.565-.301 1.108-.421 2.095-.438l.256-.002h11.59Zm0 1.8H6.205c-.88 0-1.187.06-1.502.228-.25.134-.441.325-.575.575-.156.29-.218.574-.227 1.309L3.9 7.1h16.198v-.088c-.008-.735-.07-1.018-.226-1.309a1.372 1.372 0 0 0-.575-.575c-.291-.156-.575-.218-1.309-.227l-.193-.001Z"/>
          </svg>
          <div class="caption">Пополнить</div>
        </a>
      </div>
    </div>

    <div v-if="state.card.id && state.card.history.length" class="history flex flex-col gap-1 w-full">
      <div class="summary px-4 flex items-center justify-between">
        <div class="date text-neutral-500 font-medium">{{ state.card.history.at(-1).date.locale('ru').format('D MMMM') }} — {{ state.card.history.at(0).date.locale('ru').format('D MMMM') }}</div>
        <div class="sum text-neutral-500 font-bold"> -{{ state.card.history_summary }} ₽</div>
      </div>

      <div v-for="event in state.card.history" :key="event.date" class="event flex flex-col bg-neutral-800 p-4 rounded-md gap-2">
        <div class="event-summary w-full flex justify-between items-center">
          <div class="left flex gap-4 items-center w-full">
            <div class="route-number text-xl text-green-500 font-bold flex items-center justify-center">{{ event.route_number }}</div>
            <div class="route-name text-white rounded-lg">{{ event.route_name }}</div>
          </div>

          <div class="right flex flex-col items-end">
            <div class="sum text-green-500 font-bold text-lg rounded-lg">-{{ event.sum }} ₽</div>
            <div class="date text-sm text-right text-neutral-500">{{ event.date.locale('ru').format('D MMMM в HH:mm') }}</div>
          </div>
        </div>

        <div class="line w-full bg-neutral-700 h-[1px]"></div>

        <div class="event-details flex flex-col text-neutral-500 text-sm">
          <div class="balance">Баланс: {{ event.balance }} ₽</div>
          <div class="exemption-balance">Остаток льготных поездок: {{ event.exemption_balance }}</div>
          <div class="agent">Агент: {{ event.agent }}</div>
        </div>
      </div>
    </div>

    <div class="footer flex flex-col w-full gap-2 text-center text-neutral-500 text-sm">
      <div class="actions flex gap-2 w-full">
        <a href="https://vk.com/tts_app" target="_blank" class="button bg-neutral-800">
          <svg fill="none" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><g clip-rule="evenodd" fill="currentColor" fill-rule="evenodd"><path d="m5.14631 3.63427c.76215-.4076 1.51182-.53426 3.08147-.53426h1.87222c.4971 0 .9.40294.9.9 0 .49705-.4029.9-.9.9h-1.87222c-1.48667 0-1.87061.12794-2.23259.32153-.33585.17961-.59404.4378-.77365.77365-.19359.36198-.32153.74592-.32153 2.23259v7.54442c0 1.4867.12794 1.8706.32153 2.2326.17961.3359.4378.5941.77365.7737.36198.1936.74592.3215 2.23259.3215h7.54442c1.4867 0 1.8706-.1279 2.2326-.3215.3359-.1796.5941-.4378.7737-.7737.1936-.362.3215-.7459.3215-2.2326v-1.8722c0-.4971.4029-.9.9-.9s.9.4029.9.9v1.8722c0 1.5697-.1267 2.3193-.5343 3.0815-.3473.6495-.8625 1.1647-1.512 1.512-.7622.4076-1.5118.5343-3.0815.5343h-7.54442c-1.56965 0-2.31931-.1267-3.08147-.5343-.64953-.3473-1.16467-.8625-1.51204-1.512-.4076-.7622-.53426-1.5118-.53426-3.0815v-7.54442c0-1.56965.12666-2.31932.53426-3.08147.34738-.64953.86251-1.16466 1.51204-1.51204z"/><path d="m14 4.00001c0-.49706.403-.9.9-.9h5.1c.4971 0 .9.40294.9.9v5.1c0 .49705-.4029.89999-.9.89999-.497 0-.9-.40294-.9-.89999v-2.92721l-6.5636 6.5636c-.3514.3515-.9213.3515-1.2728 0-.3514-.3515-.3514-.9213 0-1.2728l6.5636-6.56359h-2.9272c-.497 0-.9-.40295-.9-.9z"/></g></svg>
          <div class="caption">Бот ВКонтакте</div>
        </a>
        <a href="https://vk.com/tsivxrev" target="_blank" class="button bg-neutral-800">
          <svg fill="none" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><g clip-rule="evenodd" fill="currentColor" fill-rule="evenodd"><path d="m5.14631 3.63427c.76215-.4076 1.51182-.53426 3.08147-.53426h1.87222c.4971 0 .9.40294.9.9 0 .49705-.4029.9-.9.9h-1.87222c-1.48667 0-1.87061.12794-2.23259.32153-.33585.17961-.59404.4378-.77365.77365-.19359.36198-.32153.74592-.32153 2.23259v7.54442c0 1.4867.12794 1.8706.32153 2.2326.17961.3359.4378.5941.77365.7737.36198.1936.74592.3215 2.23259.3215h7.54442c1.4867 0 1.8706-.1279 2.2326-.3215.3359-.1796.5941-.4378.7737-.7737.1936-.362.3215-.7459.3215-2.2326v-1.8722c0-.4971.4029-.9.9-.9s.9.4029.9.9v1.8722c0 1.5697-.1267 2.3193-.5343 3.0815-.3473.6495-.8625 1.1647-1.512 1.512-.7622.4076-1.5118.5343-3.0815.5343h-7.54442c-1.56965 0-2.31931-.1267-3.08147-.5343-.64953-.3473-1.16467-.8625-1.51204-1.512-.4076-.7622-.53426-1.5118-.53426-3.0815v-7.54442c0-1.56965.12666-2.31932.53426-3.08147.34738-.64953.86251-1.16466 1.51204-1.51204z"/><path d="m14 4.00001c0-.49706.403-.9.9-.9h5.1c.4971 0 .9.40294.9.9v5.1c0 .49705-.4029.89999-.9.89999-.497 0-.9-.40294-.9-.89999v-2.92721l-6.5636 6.5636c-.3514.3515-.9213.3515-1.2728 0-.3514-.3515-.3514-.9213 0-1.2728l6.5636-6.56359h-2.9272c-.497 0-.9-.40295-.9-.9z"/></g></svg>
          <div class="caption">Сообщить об ошибке</div>
        </a>
      </div>
      <div class="author">made with love by <a href="https://t.me/tsivxrev" target="_blank" class="font-medium text-green-500">@tsivxrev</a></div>
    </div>
  </div>
</template>
