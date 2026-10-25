export const pythonCode = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🥔 СИМУЛЯТОР ВЫРАЩИВАНИЯ КАРТОФЕЛЯ НА ДАЧЕ 🥔
Консольная игра с механиками посадки, ухода и сбора урожая.
"""

import random
import time
import os


# ============================================================
# КЛАССЫ
# ============================================================

class Potato:
    """Класс, представляющий один куст картофеля на грядке."""

    # Стадии роста картофеля
    STAGES = {
        0: "🌱 Семянок",
        1: "🌿 Ростки",
        2: "🌸 Цветение",
        3: "🥔 Готов к сбору"
    }

    def __init__(self):
        self.stage = 0          # Текущая стадия роста (0-3)
        self.watered = False    # Полит ли куст
        self.fertilized = False # Подкормлен ли куст
        self.health = 100       # Здоровье (0-100)
        self.days_planted = 0   # Дней с момента посадки

    def grow(self):
        """
        Продвигает стадию роста, если условия благоприятны.
        Для роста нужно: быть политым и иметь здоровье > 30.
        """
        if self.watered and self.health > 30:
            # Подкормка ускоряет рост
            growth_chance = 0.7 if self.fertilized else 0.5
            if random.random() < growth_chance:
                if self.stage < 3:
                    self.stage += 1
                    return True
        return False

    def take_damage(self, amount):
        """Наносит урон здоровью куста."""
        self.health = max(0, self.health - amount)

    def is_alive(self):
        """Проверяет, жив ли куст."""
        return self.health > 0

    def is_ready(self):
        """Проверяет, готов ли картофель к сбору."""
        return self.stage >= 3 and self.health > 0

    def get_status(self):
        """Возвращает строку со статусом куста."""
        if not self.is_alive():
            return "💀 Мёртвый"
        stage_name = self.STAGES[self.stage]
        water_icon = "💧" if self.watered else "🏜️"
        fert_icon = "✨" if self.fertilized else ""
        health_bar = self._health_bar()
        return f"{stage_name} {water_icon}{fert_icon} | Здоровье: {health_bar} ({self.health}%)"

    def _health_bar(self):
        """Создаёт визуальную шкалу здоровья."""
        filled = self.health // 10
        empty = 10 - filled
        if self.health > 70:
            color = "🟩"
        elif self.health > 40:
            color = "🟨"
        else:
            color = "🟥"
        return color * filled + "⬜" * empty


class Garden:
    """Класс, представляющий дачный участок с грядками."""

    def __init__(self, beds_count=10):
        self.beds_count = beds_count
        self.beds = [None] * beds_count  # None = пустая грядка
        self.day = 1
        self.total_harvest = 0
        self.is_tilled = False  # Вскопана ли земля

    def till_soil(self):
        """Вспашка земли — подготовка к посадке."""
        if self.is_tilled:
            return "⚠️  Земля уже вспахана!"
        self.is_tilled = True
        return "✅ Земля успешно вспахана! Теперь можно сажать."

    def plant(self, bed_number):
        """Сажает картофель на указанную грядку."""
        if not self.is_tilled:
            return "⚠️  Сначала нужно вспахать землю!"
        if bed_number < 1 or bed_number > self.beds_count:
            return f"⚠️  Нет такой грядки! У вас грядки от 1 до {self.beds_count}."
        idx = bed_number - 1
        if self.beds[idx] is not None:
            return f"⚠️  Грядка {bed_number} уже занята!"
        self.beds[idx] = Potato()
        return f"🌱 На грядку {bed_number} посажен картофель!"

    def water(self, bed_number=None):
        """Полив грядки. Если номер не указан — поливает все."""
        if bed_number is not None:
            return self._water_single(bed_number)
        else:
            return self._water_all()

    def _water_single(self, bed_number):
        """Полив одной грядки."""
        if bed_number < 1 or bed_number > self.beds_count:
            return f"⚠️  Нет такой грядки!"
        idx = bed_number - 1
        if self.beds[idx] is None:
            return f"⚠️  На грядке {bed_number} ничего не посажено!"
        if not self.beds[idx].is_alive():
            return f"⚠️  На грядке {bed_number} картофель мёртвый. Зачем поливать? 😅"
        if self.beds[idx].watered:
            return f"⚠️  Грядка {bed_number} уже полита сегодня!"
        self.beds[idx].watered = True
        return f"💧 Грядка {bed_number} полита!"

    def _water_all(self):
        """Полив всех грядок."""
        watered_count = 0
        for i, bed in enumerate(self.beds):
            if bed is not None and bed.is_alive() and not bed.watered:
                bed.watered = True
                watered_count += 1
        if watered_count == 0:
            return "⚠️  Нечего поливать! Все грядки пусты или уже политы."
        return f"💧 Полито грядок: {watered_count}"

    def fertilize(self, bed_number=None):
        """Подкормка грядки. Если номер не указан — подкармливает все."""
        if bed_number is not None:
            return self._fertilize_single(bed_number)
        else:
            return self._fertilize_all()

    def _fertilize_single(self, bed_number):
        """Подкормка одной грядки."""
        if bed_number < 1 or bed_number > self.beds_count:
            return f"⚠️  Нет такой грядки!"
        idx = bed_number - 1
        if self.beds[idx] is None:
            return f"⚠️  На грядке {bed_number} ничего не посажено!"
        if not self.beds[idx].is_alive():
            return f"⚠️  Мёртвый картофель не нуждается в подкормке!"
        if self.beds[idx].fertilized:
            return f"⚠️  Грядка {bed_number} уже подкормлена!"
        self.beds[idx].fertilized = True
        # Подкормка немного восстанавливает здоровье
        self.beds[idx].health = min(100, self.beds[idx].health + 10)
        return f"✨ Грядка {bed_number} подкормлена! Здоровье +10"

    def _fertilize_all(self):
        """Подкормка всех грядок."""
        fert_count = 0
        for i, bed in enumerate(self.beds):
            if bed is not None and bed.is_alive() and not bed.fertilized:
                bed.fertilized = True
                bed.health = min(100, bed.health + 10)
                fert_count += 1
        if fert_count == 0:
            return "⚠️  Нечего подкармливать!"
        return f"✨ Подкормлено грядок: {fert_count}"

    def check_status(self, bed_number=None):
        """Проверяет состояние грядок."""
        if bed_number is not None:
            if bed_number < 1 or bed_number > self.beds_count:
                return f"⚠️  Нет такой грядки!"
            idx = bed_number - 1
            if self.beds[idx] is None:
                return f"🟫 Грядка {bed_number}: Пусто"
            return f"🛏️  Грядка {bed_number}: {self.beds[idx].get_status()}"
        else:
            return self._check_all()

    def _check_all(self):
        """Проверяет состояние всех грядок."""
        lines = ["\\n" + "═" * 50]
        lines.append("📊 СОСТОЯНИЕ УЧАСТКА")
        lines.append("═" * 50)
        for i, bed in enumerate(self.beds):
            bed_num = i + 1
            if bed is None:
                lines.append(f"  Грядка {bed_num:2d}: 🟫 Пусто")
            else:
                lines.append(f"  Грядка {bed_num:2d}: {bed.get_status()}")
        lines.append("═" * 50)
        alive = sum(1 for b in self.beds if b and b.is_alive())
        ready = sum(1 for b in self.beds if b and b.is_ready())
        lines.append(f"  📈 Всего кустов: {alive} | 🥔 Готово к сбору: {ready}")
        lines.append("═" * 50)
        return "\\n".join(lines)

    def harvest(self, bed_number=None):
        """Сбор урожая."""
        if bed_number is not None:
            return self._harvest_single(bed_number)
        else:
            return self._harvest_all()

    def _harvest_single(self, bed_number):
        """Сбор урожая с одной грядки."""
        if bed_number < 1 or bed_number > self.beds_count:
            return f"⚠️  Нет такой грядки!"
        idx = bed_number - 1
        if self.beds[idx] is None:
            return f"⚠️  На грядке {bed_number} ничего не посажено!"
        if not self.beds[idx].is_alive():
            # Убираем мёртвый куст
            self.beds[idx] = None
            return f"💀 Мёртвый куст убран с грядки {bed_number}. Урожая нет."
        if not self.beds[idx].is_ready():
            stage = Potato.STAGES[self.beds[idx].stage]
            return f"⚠️  Картофель на грядке {bed_number} ещё не готов! Стадия: {stage}"
        # Рассчитываем урожай в зависимости от здоровья
        health_bonus = self.beds[idx].health / 100
        potatoes = int(5 + 10 * health_bonus)  # От 5 до 15 штук
        self.total_harvest += potatoes
        self.beds[idx] = None  # Грядка освобождается
        return f"🥔 Собрано {potatoes} картофелин с грядки {bed_number}! (Всего: {self.total_harvest})"

    def _harvest_all(self):
        """Сбор урожая со всех готовых грядок."""
        total = 0
        harvested_beds = 0
        for i, bed in enumerate(self.beds):
            if bed is not None and bed.is_ready():
                health_bonus = bed.health / 100
                potatoes = int(5 + 10 * health_bonus)
                total += potatoes
                harvested_beds += 1
                self.beds[i] = None
        if total == 0:
            return "⚠️  Нет готового к сбору картофеля!"
        self.total_harvest += total
        return f"🥔 Собрано {total} картофелин с {harvested_beds} грядок! (Всего за сезон: {self.total_harvest})"

    def next_day(self):
        """
        Переход к следующему дню.
        Сбрасывает ежедневные состояния, запускает рост и случайные события.
        """
        self.day += 1
        events = []

        # Сбрасываем ежедневные состояния
        for bed in self.beds:
            if bed is not None:
                bed.watered = False
                bed.fertilized = False

        # Рост картофеля
        for bed in self.beds:
            if bed is not None and bed.is_alive():
                bed.days_planted += 1
                bed.grow()

        # Случайные события (20% шанс)
        if random.random() < 0.2:
            event = self._random_event()
            events.append(event)

        return events

    def _random_event(self):
        """Генерирует случайное событие."""
        event_type = random.choice(["rain", "beetle", "sun"])

        if event_type == "rain":
            # Дождь — автоматический полив
            for bed in self.beds:
                if bed is not None and bed.is_alive():
                    bed.watered = True
            return "🌧️  СЛУЧАЙНОЕ СОБЫТИЕ: Пошёл дождь! Все грядки политы автоматически!"

        elif event_type == "beetle":
            # Колорадский жук — урон
            alive_beds = [(i, b) for i, b in enumerate(self.beds) if b and b.is_alive()]
            if alive_beds:
                target_idx, target = random.choice(alive_beds)
                damage = random.randint(15, 35)
                target.take_damage(damage)
                bed_num = target_idx + 1
                if not target.is_alive():
                    return f"🪲 СЛУЧАЙНОЕ СОБЫТИЕ: Колорадский жук атаковал грядку {bed_num}! Урон {damage}%. Куст погиб! 💀"
                return f"🪲 СЛУЧАЙНОЕ СОБЫТИЕ: Колорадский жук атаковал грядку {bed_num}! Урон {damage}%"
            return "🪲 СЛУЧАЙНОЕ СОБЫТИЕ: Колорадский жук прилетел, но есть нечего!"

        elif event_type == "sun":
            # Отличная погода — бонус к росту
            for bed in self.beds:
                if bed is not None and bed.is_alive() and bed.stage < 3:
                    if random.random() < 0.5:
                        bed.stage += 1
            return "☀️  СЛУЧАЙНОЕ СОБЫТИЕ: Отличная погода! Картофель ускоренно растёт!"


# ============================================================
# ФУНКЦИИ ИНТЕРФЕЙСА
# ============================================================

def clear_screen():
    """Очищает экран консоли."""
    os.system('cls' if os.name == 'nt' else 'clear')


def print_header():
    """Выводит заголовок игры."""
    print()
    print("╔══════════════════════════════════════════════════╗")
    print("║    🥔  СИМУЛЯТОР ВЫРАЩИВАНИЯ КАРТОФЕЛЯ  🥔     ║")
    print("║              ~ Дачный сезон 2024 ~              ║")
    print("╚══════════════════════════════════════════════════╝")
    print()


def print_menu(day):
    """Выводит меню действий."""
    print(f"\\n{'─' * 45}")
    print(f"  📅 День: {day}")
    print(f"{'─' * 45}")
    print("  Выберите действие:")
    print()
    print("  1. 🚜 Вскопать землю")
    print("  2. 🌱 Посадить картофель")
    print("  3. 💧 Полить (одну грядку / все)")
    print("  4. ✨  Подкормить (одну грядку / все)")
    print("  5. 📊 Проверить состояние")
    print("  6. 🥔 Собрать урожай")
    print("  7. ⏭️  Следующий день")
    print("  0. 🚪 Завершить игру")
    print()


def get_input(prompt="Ваш выбор: "):
    """Получает ввод от пользователя."""
    try:
        return input(prompt).strip()
    except (EOFError, KeyboardInterrupt):
        return "0"


# ============================================================
# ОСНОВНАЯ ФУНКЦИЯ ИГРЫ
# ============================================================

def main():
    """Главная функция — запускает игровой цикл."""
    clear_screen()
    print_header()

    # Создаём участок на 10 грядок
    garden = Garden(beds_count=10)

    print("  🏡 Добро пожаловать на вашу дачу!")
    print("  У вас есть участок с 10 грядками.")
    print("  Ваша цель — вырастить и собрать как можно больше картофеля!")
    print()
    input("  Нажмите Enter, чтобы начать...")

    # Основной игровой цикл
    while True:
        clear_screen()
        print_header()
        print_menu(garden.day)

        choice = get_input()

        if choice == "0":
            # Завершение игры
            print()
            print("╔══════════════════════════════════════════════════╗")
            print(f"║  🏆 ИТОГО ЗА СЕЗОН: {garden.total_harvest} картофелин")
            print(f"║  📅 Пройдено дней: {garden.day}")
            print("╚══════════════════════════════════════════════════╝")
            print()
            print("  Спасибо за игру! До новых урожаев! 🌾")
            print()
            break

        elif choice == "1":
            # Вскопать землю
            result = garden.till_soil()
            print(f"\\n  {result}")

        elif choice == "2":
            # Посадить картофель
            bed_input = get_input("  На какую грядку посадить (1-10)? ")
            try:
                bed_num = int(bed_input)
                result = garden.plant(bed_num)
                print(f"\\n  {result}")
            except ValueError:
                print("\\n  ⚠️  Введите число!")

        elif choice == "3":
            # Полить
            water_choice = get_input("  Полить одну грядку (введите номер) или все (Enter)? ")
            if water_choice == "":
                result = garden.water()
            else:
                try:
                    result = garden.water(int(water_choice))
                except ValueError:
                    result = "⚠️  Введите число!"
            print(f"\\n  {result}")

        elif choice == "4":
            # Подкормить
            fert_choice = get_input("  Подкормить одну грядку (введите номер) или все (Enter)? ")
            if fert_choice == "":
                result = garden.fertilize()
            else:
                try:
                    result = garden.fertilize(int(fert_choice))
                except ValueError:
                    result = "⚠️  Введите число!"
            print(f"\\n  {result}")

        elif choice == "5":
            # Проверить состояние
            result = garden.check_status()
            print(result)

        elif choice == "6":
            # Собрать урожай
            harvest_choice = get_input("  Собрать с одной грядки (введите номер) или все (Enter)? ")
            if harvest_choice == "":
                result = garden.harvest()
            else:
                try:
                    result = garden.harvest(int(harvest_choice))
                except ValueError:
                    result = "⚠️  Введите число!"
            print(f"\\n  {result}")

        elif choice == "7":
            # Следующий день
            events = garden.next_day()
            print(f"\\n  ⏭️  Наступил день {garden.day}!")
            for event in events:
                print(f"\\n  {event}")

            # Показываем краткий статус после нового дня
            alive = sum(1 for b in garden.beds if b and b.is_alive())
            ready = sum(1 for b in garden.beds if b and b.is_ready())
            print(f"\\n  📈 Активных кустов: {alive} | Готово к сбору: {ready}")

        else:
            print("\\n  ⚠️  Неизвестная команда! Введите число от 0 до 7.")

        # Пауза для чтения
        input("\\n  Нажмите Enter для продолжения...")


# ============================================================
# ТОЧКА ВХОДА
# ============================================================

if __name__ == "__main__":
    main()
`;
