export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqSection {
  title: string;
  items: FaqItem[];
}

export const FAQ: FaqSection[] = [
  {
    title: 'Calculator',
    items: [
      {
        q: 'How do I do a basic calculation?',
        a: 'Tap the numbers and operators, then tap =. A grey preview of the answer appears above the keypad while you type, so you often do not need to press = at all.',
      },
      {
        q: 'How does the % key work?',
        a: 'It works the way people expect:\n\n• 200 + 10% = 220 (adds 10% of 200)\n• 200 − 10% = 180\n• 200 × 10% = 20\n• 10% on its own = 0.1',
      },
      {
        q: 'What does the ( ) key do?',
        a: 'It picks the right bracket for you. It opens a bracket normally, closes one when a bracket is already open, and adds × before a bracket that follows a number (5 then ( ) gives 5×().',
      },
      {
        q: 'How do I edit or insert in the middle of an expression?',
        a: 'Tap the expression to place the blinking cursor exactly where you want it. New digits and operators are inserted at the cursor, and backspace deletes the character just before it. You can also drag the cursor handles to select several characters, then type or press backspace to replace or delete them.',
      },
      {
        q: 'How do I delete or clear?',
        a: 'Tap the backspace key to delete the character before the cursor (or the selected text). Long-press backspace, or tap C, to clear everything.',
      },
      {
        q: 'How do I copy a formula or the answer?',
        a: 'Tap the copy icon under the expression to copy the formula exactly as it is on screen (for example 12+34×5, without commas). To copy only the answer, long-press the grey result line. In History, long-press an entry to copy its formula. You can also long-press the expression to use the system Cut, Copy and Select all menu.',
      },
      {
        q: 'How do I paste a formula or a number?',
        a: 'Tap the clipboard icon to paste at the cursor. A copied formula comes back as an editable formula, so you can change any part of it. Commas, spaces and currency symbols are removed automatically (₹1,23,456 pastes as 123456), and if the text contains an equals sign only the part before it is used. You can also long-press the expression and choose Paste.',
      },
      {
        q: 'Does KingCalc work in landscape?',
        a: 'Yes. Turn your phone sideways (make sure auto-rotate is on). The display and keypad sit side by side, and the extra keys (√, x², π, xʸ) are always visible in the first column.',
      },
      {
        q: 'What is the ••• button for?',
        a: 'It shows an extra row of keys: √ (square root), x² (square), π and xʸ (power). Tap it again to hide the row.',
      },
      {
        q: 'Where is my history?',
        a: 'Tap the clock icon at the top right. Tap any entry to bring its result back into the calculator. Tap Clear to delete the list. History is saved only on your phone.',
      },
      {
        q: 'What is the 00 key?',
        a: 'It types two zeros at once, which is handy for large amounts like 5,00,000.',
      },
    ],
  },
  {
    title: 'Currency',
    items: [
      {
        q: 'How do I convert currencies?',
        a: 'Type an amount, then tap the currency button next to it to choose From and To. The answer updates instantly. Tap the round arrow button to swap the two currencies.',
      },
      {
        q: 'How do I find a currency quickly?',
        a: 'In the currency list, use the Search box and type a code or a name (for example INR or rupee). Tap the star next to a currency to make it a favourite. Favourites stay at the top of the list.',
      },
      {
        q: 'Does it work offline?',
        a: 'Yes. Rates are saved on your phone after the first load, and the screen shows when they were last updated. The very first time you use it you need an internet connection.',
      },
      {
        q: 'How do I refresh the rates?',
        a: 'Pull down on the Currency screen. The rates source updates once a day, so the app refreshes at most once an hour. Rates are for information only and may differ from what a bank or money changer gives you.',
      },
    ],
  },
  {
    title: 'Units',
    items: [
      {
        q: 'How do I convert units?',
        a: 'Pick a category at the top (Length, Weight, Temperature, Area, Volume, Speed, Time or Data), enter a value, and choose the From and To units. The list at the bottom shows the value in every unit of that category at once.',
      },
      {
        q: 'Which area units are included?',
        a: 'Besides m², ft², acre and hectare, there are cent, guntha and ground, which are common in India. 1 cent = 435.6 ft², 1 guntha = 1,089 ft², 1 ground = 2,400 ft².',
      },
      {
        q: 'How are data units calculated?',
        a: 'KingCalc uses binary units, so 1 KB = 1,024 bytes and 1 MB = 1,024 KB. This matches how most phones and computers report storage.',
      },
      {
        q: 'Can I enter negative temperatures?',
        a: 'Yes. On the Temperature category the field accepts a minus sign, for example -40.',
      },
    ],
  },
  {
    title: 'Percent',
    items: [
      {
        q: 'What can the Percent screen do?',
        a: 'It has three modes:\n\n• X% of Y: what is 15% of 800? (120)\n• X is ?% of Y: 50 is what % of 400? (12.5%)\n• % change: from 80 to 100 is a 25% increase.',
      },
      {
        q: 'How do I calculate a discount or a tip?',
        a: 'Use X% of Y to find the discount amount (20% of 1,500 = 300), then subtract it. For a tip, work out the tip amount the same way and add it.',
      },
    ],
  },
  {
    title: 'Loan / EMI',
    items: [
      {
        q: 'How do I calculate my EMI?',
        a: 'Enter the loan amount, the yearly interest rate and the tenure. Choose Years or Months for the tenure. You get the monthly EMI, the total interest and the total amount payable.',
      },
      {
        q: 'What is the payment schedule?',
        a: 'Tap Show payment schedule to see, for every month, how much of your EMI goes to principal and interest, and the balance left. In the early months most of the EMI is interest.',
      },
      {
        q: 'Are the results exact?',
        a: 'They use the standard reducing-balance formula. Your lender may differ slightly because of processing fees, rounding, or a different way of counting days, so treat it as a close estimate.',
      },
    ],
  },
  {
    title: 'Settings and privacy',
    items: [
      {
        q: 'How do I change the look?',
        a: 'Open Settings. Choose Black (pure black, saves battery on OLED screens), White or System (follows your phone). You can also pick one of five fonts. Each font shows a live preview.',
      },
      {
        q: 'What are Indian and International number formats?',
        a: 'Indian grouping writes 1,00,000 and International writes 100,000. The setting applies to the calculator, history and every other screen.',
      },
      {
        q: 'What does the decimal places setting do?',
        a: 'It sets the maximum number of decimals shown in results. Trailing zeros are hidden, so 2.50 shows as 2.5.',
      },
      {
        q: 'Does KingCalc collect my data?',
        a: 'No. There are no accounts, ads, analytics or tracking. History and settings stay on your phone. The only network request is the currency rates download, which contains none of your data.',
      },
      {
        q: 'How do I delete my history?',
        a: 'Go to Settings and tap Clear calculation history, or use Clear inside the History sheet on the calculator.',
      },
      {
        q: 'Is KingCalc open source? How do I contact you?',
        a: 'Yes, it is free and MIT licensed. The link to the source code is on the About screen. For questions or bug reports, email Yashwanthramsomireddy@gmail.com or open an issue on GitHub.',
      },
    ],
  },
];
