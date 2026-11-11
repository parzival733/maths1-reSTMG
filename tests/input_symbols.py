"""Actions utilisateur communes sur le menu de signes d'un champ numérique."""


def symbol_button(field, key):
    return field.locator('xpath=ancestor::form[1]').locator('[data-symbol="' + key + '"]')


def choose_symbol(field, key, touch=True):
    if not field.evaluate('e => e === document.activeElement'):
        field.focus()
    trigger = field.locator('xpath=ancestor::form[1]').locator('.answer-symbols-toggle')
    if trigger.get_attribute('aria-expanded') != 'true':
        trigger.tap() if touch else trigger.click()
    button = symbol_button(field, key)
    button.tap() if touch else button.click()
