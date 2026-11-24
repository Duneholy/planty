// Рисует public/gallery.js: узнаваемые комнатные растения и разные силуэты питомцев.
const fs = require('fs');
const path = require('path');

const pot = (body, rim) =>
  `<path d="M64 150 h72 l-8 34 a8 8 0 0 1 -8 6 h-40 a8 8 0 0 1 -8 -6 z" fill="${body}"/><rect x="58" y="144" width="84" height="14" rx="7" fill="${rim}"/>`;

const wrap = (label, inner, body = '#E2795B', rim = '#C05B40') =>
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">${inner}${pot(body, rim)}</svg>`;

const PLANTS = {
  monstera: wrap('Монстера', `
    <g fill="#1F7A3D">
      <path fill-rule="evenodd" d="M78 146 C48 132 36 96 52 68 C64 48 86 52 92 70 C86 50 108 40 118 58 C128 42 150 58 142 86 C156 108 140 140 108 148 C96 140 88 148 78 146 Z M70 88 a7 11 0 1 0 .1 0 M92 78 a6 9 0 1 0 .1 0 M108 96 a6 10 0 1 0 .1 0 M124 78 a5 8 0 1 0 .1 0"/>
      <path fill-rule="evenodd" d="M118 150 C108 118 128 96 150 88 C168 82 176 64 164 52 C154 44 140 52 142 66 C150 54 168 62 162 78 C170 92 156 112 138 118 C148 132 136 150 118 150 Z M146 78 a5 7 0 1 0 .1 0 M156 96 a4 6 0 1 0 .1 0"/>
    </g>
    <path d="M96 150 C94 120 100 96 108 78" stroke="#1F5E33" stroke-width="4" fill="none" stroke-linecap="round"/>`, '#4FA3E0', '#3579B5'),

  pothos: wrap('Эпипремнум', `
    <g fill="#2E9E52">
      <path d="M100 148 C92 120 70 108 48 112 C36 114 34 100 46 94 C58 88 78 96 88 112 C80 90 92 70 112 66 C128 62 138 78 128 92 C140 84 156 96 148 112 C140 128 118 136 100 148 Z"/>
      <path d="M108 120 C130 100 158 108 168 92 C176 80 166 68 154 74 C148 78 146 90 136 98"/>
    </g>
    <g fill="#57C878">
      <path d="M128 96 C140 84 158 88 162 76 C166 66 154 60 146 68 C140 74 136 86 128 96 Z"/>
      <path d="M70 108 C56 96 40 100 36 88 C32 78 44 72 52 80 C58 86 64 98 70 108 Z"/>
    </g>
    <path d="M100 150 C96 124 88 108 78 100 M96 128 C112 116 126 112 140 100" stroke="#1F7A3D" stroke-width="3" fill="none" stroke-linecap="round"/>`, '#F5C64F', '#DFA92E'),

  aloe: wrap('Алоэ', `
    <g fill="#3E8E4F">
      <path d="M100 148 C96 120 70 108 46 118 C38 122 40 108 52 96 C62 86 84 96 96 118 Z"/>
      <path d="M100 148 C104 120 130 108 154 118 C162 122 160 108 148 96 C138 86 116 96 104 118 Z"/>
      <path d="M100 150 C98 118 86 96 74 78 C68 68 78 60 86 70 C94 84 98 110 100 132 Z"/>
      <path d="M100 150 C102 118 114 96 126 78 C132 68 122 60 114 70 C106 84 102 110 100 132 Z"/>
      <path d="M100 148 C100 112 100 88 100 62 C100 52 108 50 108 62 C108 90 106 120 102 148 Z"/>
    </g>
    <g fill="#EAF6DF" opacity=".85">
      <circle cx="78" cy="100" r="2.2"/><circle cx="86" cy="112" r="2"/><circle cx="122" cy="100" r="2.2"/><circle cx="114" cy="112" r="2"/><circle cx="100" cy="84" r="2"/>
    </g>`, '#E2795B', '#C05B40'),

  sansevieria: wrap('Сансевиерия', `
    <g>
      <path d="M86 150 C84 110 78 70 70 36 C78 48 90 90 94 150 Z" fill="#1F7A3D"/>
      <path d="M100 150 C100 100 102 60 108 28 C116 48 112 100 108 150 Z" fill="#2E9E52"/>
      <path d="M114 150 C118 112 128 74 140 40 C132 58 122 108 116 150 Z" fill="#3E8E4F"/>
      <path d="M72 150 C66 118 56 88 46 58 C56 72 68 112 76 150 Z" fill="#2B6E3C"/>
      <path d="M128 150 C136 116 148 86 160 56 C150 72 136 114 126 150 Z" fill="#1F5E33"/>
    </g>
    <g stroke="#C9E265" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M80 70 h8 M78 96 h10 M100 60 h8 M102 92 h10 M124 72 h8 M148 90 h8"/>
    </g>`, '#F5C64F', '#DFA92E'),

  philodendron: wrap('Филодендрон', `
    <g stroke="#8A5A32" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M100 150 C98 124 96 104 100 86"/>
      <path d="M100 110 C82 100 68 96 52 100"/>
      <path d="M100 96 C118 84 134 80 150 86"/>
    </g>
    <g fill="#2E9E52">
      <path d="M100 86 C78 78 70 52 86 40 C98 32 112 40 112 54 C112 40 128 34 136 48 C148 64 122 86 100 86 Z"/>
      <path d="M52 100 C34 92 30 68 46 58 C58 50 70 60 68 72 C70 58 84 56 88 70 C94 86 70 104 52 100 Z"/>
      <path d="M150 86 C168 76 172 54 156 44 C144 36 132 48 136 60 C132 46 118 48 116 62 C112 80 134 92 150 86 Z"/>
    </g>`, '#4FA3E0', '#3579B5'),

  begonia: wrap('Бегония', `
    <g fill="#3E8E4F">
      <path d="M70 132 C48 120 44 88 64 74 C78 64 96 78 92 98 C100 78 118 70 124 90 C132 112 108 136 86 138 C80 130 76 134 70 132 Z"/>
      <path d="M124 128 C108 112 112 82 136 74 C154 68 166 90 154 108 C160 90 172 96 164 114 C156 132 136 138 124 128 Z"/>
    </g>
    <g fill="#C9E265" opacity=".7">
      <circle cx="78" cy="100" r="7"/><circle cx="92" cy="112" r="5"/><circle cx="140" cy="100" r="6"/>
    </g>
    <g fill="#F0567E">
      <circle cx="58" cy="62" r="8"/><circle cx="72" cy="52" r="7"/><circle cx="150" cy="58" r="8"/><circle cx="136" cy="48" r="6"/>
    </g>`, '#F5C64F', '#DFA92E'),

  orchid: wrap('Орхидея', `
    <path d="M100 150 C102 120 108 96 118 72" stroke="#3E8E4F" stroke-width="4" fill="none" stroke-linecap="round"/>
    <g fill="#FDFDF5">
      <ellipse cx="118" cy="58" rx="10" ry="16" transform="rotate(-20 118 58)"/>
      <ellipse cx="104" cy="66" rx="9" ry="14" transform="rotate(40 104 66)"/>
      <ellipse cx="132" cy="68" rx="9" ry="14" transform="rotate(-70 132 68)"/>
    </g>
    <ellipse cx="118" cy="70" rx="7" ry="9" fill="#F2A9C4"/>
    <ellipse cx="118" cy="74" rx="3" ry="4" fill="#E8496A"/>
    <g fill="#FDFDF5">
      <ellipse cx="96" cy="96" rx="8" ry="13" transform="rotate(16 96 96)"/>
      <ellipse cx="84" cy="104" rx="7" ry="11" transform="rotate(50 84 104)"/>
    </g>
    <ellipse cx="92" cy="108" rx="5" ry="7" fill="#A96FD6"/>`, '#E2795B', '#C05B40'),

  'cactus-barrel': wrap('Эхинокактус', `
    <ellipse cx="100" cy="108" rx="46" ry="40" fill="#2E9E52"/>
    <g stroke="#1F7A3D" stroke-width="3" fill="none">
      <path d="M70 92 C78 108 78 124 70 140"/><path d="M86 80 C92 108 92 132 86 148"/>
      <path d="M114 80 C108 108 108 132 114 148"/><path d="M130 92 C122 108 122 124 130 140"/>
    </g>
    <g stroke="#F5C64F" stroke-width="2" fill="none">
      <path d="M78 96 l4 4 M92 88 l3 5 M108 88 l-3 5 M122 96 l-4 4 M84 120 l4 3 M116 120 l-4 3"/>
    </g>
    <circle cx="128" cy="78" r="8" fill="#F0567E"/><circle cx="140" cy="90" r="6" fill="#F5A503"/>`, '#E2795B', '#C05B40'),

  'cactus-opuntia': wrap('Опунция', `
    <g fill="#3E8E4F">
      <ellipse cx="100" cy="128" rx="22" ry="28"/>
      <ellipse cx="78" cy="96" rx="18" ry="24" transform="rotate(-28 78 96)"/>
      <ellipse cx="124" cy="92" rx="18" ry="24" transform="rotate(24 124 92)"/>
      <ellipse cx="108" cy="62" rx="14" ry="18" transform="rotate(8 108 62)"/>
    </g>
    <g fill="#1F7A3D">
      <circle cx="92" cy="118" r="2"/><circle cx="108" cy="124" r="2"/><circle cx="74" cy="90" r="2"/><circle cx="128" cy="86" r="2"/><circle cx="108" cy="56" r="1.8"/>
    </g>`, '#F5C64F', '#DFA92E'),

  lavender: wrap('Лаванда', `
    <g stroke="#3E8E4F" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M78 150 C76 120 74 96 72 78"/><path d="M100 150 C100 116 100 92 100 70"/>
      <path d="M122 150 C124 120 126 96 128 78"/><path d="M88 150 C84 124 80 104 76 90"/>
      <path d="M112 150 C116 124 120 104 124 90"/>
    </g>
    <g fill="#8E5DB5">
      <ellipse cx="72" cy="62" rx="7" ry="18"/><ellipse cx="100" cy="52" rx="8" ry="20"/>
      <ellipse cx="128" cy="62" rx="7" ry="18"/><ellipse cx="76" cy="78" rx="6" ry="14"/><ellipse cx="124" cy="78" rx="6" ry="14"/>
    </g>
    <g fill="#C9B6E4">
      <ellipse cx="72" cy="58" rx="3" ry="8"/><ellipse cx="100" cy="48" rx="3.5" ry="9"/><ellipse cx="128" cy="58" rx="3" ry="8"/>
    </g>`, '#A96FD6', '#7C4DA0'),

  basil: wrap('Базилик', `
    <path d="M100 150 C100 120 100 96 100 78" stroke="#1F7A3D" stroke-width="4" fill="none"/>
    <g fill="#2E9E52">
      <ellipse cx="100" cy="58" rx="16" ry="22"/>
      <ellipse cx="74" cy="78" rx="16" ry="20" transform="rotate(-30 74 78)"/>
      <ellipse cx="126" cy="78" rx="16" ry="20" transform="rotate(30 126 78)"/>
      <ellipse cx="78" cy="108" rx="15" ry="18" transform="rotate(-18 78 108)"/>
      <ellipse cx="122" cy="108" rx="15" ry="18" transform="rotate(18 122 108)"/>
    </g>`, '#E2795B', '#C05B40'),

  mint: wrap('Мята', `
    <g stroke="#2B6E3C" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M100 150 C98 118 90 96 78 80"/><path d="M100 150 C104 116 118 98 136 86"/>
    </g>
    <g fill="#57C878">
      <path d="M78 80 C60 70 52 48 70 40 C84 34 96 50 90 66 C96 50 112 48 116 64 C120 80 100 90 78 80 Z"/>
      <path d="M136 86 C154 74 164 52 146 42 C132 34 118 50 124 66 C116 52 104 58 108 74 C112 90 124 94 136 86 Z"/>
      <path d="M100 118 C82 108 74 88 90 80 C104 74 116 90 110 104 C116 90 130 92 128 108 C126 122 112 126 100 118 Z"/>
    </g>
    <g stroke="#1F7A3D" stroke-width="1.5" fill="none">
      <path d="M78 56 C86 62 92 70 90 78"/><path d="M140 60 C132 68 126 76 128 84"/>
    </g>`, '#4FA3E0', '#3579B5'),

  rosemary: wrap('Розмарин', `
    <g stroke="#8A5A32" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M86 150 C80 120 72 96 64 72"/><path d="M100 150 C100 116 102 90 104 64"/>
      <path d="M116 150 C122 120 130 96 138 74"/>
    </g>
    <g stroke="#2E9E52" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M70 110 l-10 -4 M74 98 l-12 -2 M68 86 l-10 2 M78 74 l-8 -6"/>
      <path d="M96 108 l-8 6 M98 94 l10 -4 M100 80 l-8 -6 M104 68 l8 -4"/>
      <path d="M128 112 l10 2 M132 98 l12 -4 M136 84 l8 4 M134 72 l10 -2"/>
    </g>`, '#E2795B', '#C05B40'),

  tulip: wrap('Тюльпан', `
    <g stroke="#3E8E4F" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M70 150 C68 120 66 96 64 78"/><path d="M100 150 C100 112 100 86 100 66"/>
      <path d="M130 150 C132 120 134 98 136 80"/>
    </g>
    <g fill="#3E8E4F">
      <path d="M52 118 C40 100 48 88 64 96 C58 108 56 120 52 118 Z"/>
      <path d="M148 120 C160 102 152 88 136 98 C142 110 146 122 148 120 Z"/>
    </g>
    <g fill="#E8496A">
      <path d="M64 78 C56 62 58 42 72 36 C80 44 78 64 70 78 Z"/>
      <path d="M64 78 C72 58 88 48 92 62 C84 74 74 80 64 78 Z"/>
      <path d="M100 66 C92 46 100 28 112 30 C116 46 112 62 104 70 Z"/>
      <path d="M100 66 C112 48 128 46 126 62 C118 74 106 74 100 66 Z"/>
      <path d="M136 80 C128 62 132 42 146 40 C152 54 148 74 140 82 Z"/>
      <path d="M136 80 C146 64 162 62 160 78 C150 88 140 86 136 80 Z"/>
    </g>`, '#F0567E', '#C24A6B'),

  violet: wrap('Фиалка', `
    <g fill="#2B6E3C">
      <ellipse cx="70" cy="118" rx="22" ry="16" transform="rotate(-20 70 118)"/>
      <ellipse cx="130" cy="118" rx="22" ry="16" transform="rotate(20 130 118)"/>
      <ellipse cx="86" cy="132" rx="20" ry="14"/><ellipse cx="114" cy="132" rx="20" ry="14"/>
      <ellipse cx="100" cy="108" rx="18" ry="14"/>
    </g>
    <g fill="#A96FD6">
      <circle cx="78" cy="72" r="10"/><circle cx="100" cy="62" r="11"/><circle cx="122" cy="72" r="10"/>
      <circle cx="88" cy="88" r="9"/><circle cx="112" cy="88" r="9"/>
    </g>
    <g fill="#F2A9C4">
      <circle cx="78" cy="72" r="4"/><circle cx="100" cy="62" r="4.5"/><circle cx="122" cy="72" r="4"/>
    </g>`, '#F5C64F', '#DFA92E'),

  peperomia: wrap('Пеперомия', `
    <g stroke="#2B6E3C" stroke-width="3" fill="none">
      <path d="M100 150 C98 132 90 122 82 112"/><path d="M100 150 C104 128 118 116 130 104"/>
      <path d="M96 150 C88 136 72 128 58 124"/>
    </g>
    <g fill="#3E8E4F">
      <ellipse cx="78" cy="96" rx="20" ry="16"/>
      <ellipse cx="132" cy="90" rx="22" ry="16"/>
      <ellipse cx="56" cy="116" rx="16" ry="12"/>
    </g>
    <g stroke="#C9E265" stroke-width="2" fill="none">
      <path d="M64 96 h28 M66 102 h24 M116 90 h30 M118 96 h26 M46 116 h20"/>
    </g>`, '#4FA3E0', '#3579B5'),

  hoya: wrap('Хойя', `
    <g fill="#1F5E33">
      <ellipse cx="72" cy="100" rx="18" ry="12" transform="rotate(-24 72 100)"/>
      <ellipse cx="108" cy="86" rx="20" ry="12" transform="rotate(16 108 86)"/>
      <ellipse cx="138" cy="108" rx="16" ry="11" transform="rotate(30 138 108)"/>
      <ellipse cx="96" cy="122" rx="18" ry="11"/>
    </g>
    <g transform="translate(118 62)" fill="#FDFDF5">
      <ellipse cx="0" cy="-12" rx="5" ry="12"/><ellipse cx="0" cy="-12" rx="5" ry="12" transform="rotate(72)"/>
      <ellipse cx="0" cy="-12" rx="5" ry="12" transform="rotate(144)"/><ellipse cx="0" cy="-12" rx="5" ry="12" transform="rotate(216)"/>
      <ellipse cx="0" cy="-12" rx="5" ry="12" transform="rotate(288)"/>
      <circle r="4" fill="#F0567E"/>
    </g>`, '#E2795B', '#C05B40'),

  bromeliad: wrap('Гузмания', `
    <g fill="#2E9E52">
      <path d="M100 148 C70 140 40 120 36 96 C48 108 78 124 100 136 Z"/>
      <path d="M100 148 C130 140 160 120 164 96 C152 108 122 124 100 136 Z"/>
      <path d="M100 146 C78 128 62 100 66 78 C80 96 92 120 100 140 Z"/>
      <path d="M100 146 C122 128 138 100 134 78 C120 96 108 120 100 140 Z"/>
    </g>
    <g fill="#E8496A">
      <path d="M100 118 C88 100 90 72 100 52 C110 72 112 100 100 118 Z"/>
      <path d="M100 108 C86 96 84 74 96 62 C100 80 100 96 100 108 Z"/>
      <path d="M100 108 C114 96 116 74 104 62 C100 80 100 96 100 108 Z"/>
    </g>`, '#F0567E', '#C24A6B'),

  spathiphyllum: wrap('Спатифиллум', `
    <g stroke="#2B6E3C" stroke-width="3" fill="none">
      <path d="M78 150 C70 120 62 100 58 82"/><path d="M122 150 C130 120 138 100 142 84"/>
      <path d="M100 150 C100 118 100 96 100 78"/>
    </g>
    <g fill="#2E9E52">
      <ellipse cx="58" cy="70" rx="18" ry="28" transform="rotate(-16 58 70)"/>
      <ellipse cx="142" cy="72" rx="18" ry="28" transform="rotate(16 142 72)"/>
      <ellipse cx="100" cy="64" rx="16" ry="26"/>
    </g>
    <g fill="#FDFDF5">
      <path d="M92 108 C80 96 82 72 100 66 C112 78 108 104 96 112 Z"/>
      <path d="M118 48 C128 36 146 40 144 56 C132 52 120 56 118 48 Z"/>
    </g>
    <path d="M100 78 C100 70 100 62 102 54" stroke="#F5A503" stroke-width="2"/>`, '#F5C64F', '#DFA92E'),

  dieffenbachia: wrap('Диффенбахия', `
    <path d="M96 150 C92 120 88 100 84 86" stroke="#3E8E4F" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g>
      <path d="M84 88 C60 78 48 52 66 36 C80 24 96 36 96 52 C96 34 116 28 126 44 C140 64 112 86 84 88 Z" fill="#3E8E4F"/>
      <path d="M86 80 C70 72 62 56 74 46 C84 38 94 48 94 58 C96 46 108 44 114 54 C122 68 104 80 86 80 Z" fill="#EAF6DF"/>
      <path d="M130 118 C112 108 108 86 124 74 C136 66 148 80 144 94 C150 82 160 90 154 104 C146 120 136 124 130 118 Z" fill="#2E9E52"/>
      <ellipse cx="136" cy="96" rx="10" ry="14" fill="#EAF6DF" transform="rotate(18 136 96)"/>
    </g>`, '#4FA3E0', '#3579B5'),

  aglaonema: wrap('Аглаонема', `
    <g stroke="#2B6E3C" stroke-width="3" fill="none">
      <path d="M90 150 C82 122 74 100 68 82"/><path d="M110 150 C118 122 126 102 132 84"/>
      <path d="M100 150 C100 118 100 96 100 76"/>
    </g>
    <g fill="#2E9E52">
      <ellipse cx="66" cy="68" rx="16" ry="28" transform="rotate(-18 66 68)"/>
      <ellipse cx="134" cy="70" rx="16" ry="28" transform="rotate(18 134 70)"/>
      <ellipse cx="100" cy="60" rx="15" ry="28"/>
    </g>
    <g stroke="#F0567E" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M66 50 v36"/><path d="M100 42 v36"/><path d="M134 52 v36"/>
    </g>`, '#F0567E', '#C24A6B'),

  tradescantia: wrap('Традесканция', `
    <g stroke="#7C4DA0" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M100 148 C80 130 60 124 40 128"/><path d="M100 148 C120 128 146 120 168 128"/>
      <path d="M96 146 C78 150 58 156 42 150"/>
    </g>
    <g>
      <ellipse cx="48" cy="118" rx="14" ry="8" fill="#8E5DB5" transform="rotate(-16 48 118)"/>
      <ellipse cx="48" cy="118" rx="6" ry="3" fill="#C9E265"/>
      <ellipse cx="72" cy="128" rx="14" ry="8" fill="#6B3D91" transform="rotate(10 72 128)"/>
      <ellipse cx="72" cy="128" rx="6" ry="3" fill="#EAF6DF"/>
      <ellipse cx="150" cy="116" rx="14" ry="8" fill="#8E5DB5" transform="rotate(20 150 116)"/>
      <ellipse cx="150" cy="116" rx="6" ry="3" fill="#C9E265"/>
      <ellipse cx="128" cy="132" rx="13" ry="7" fill="#A96FD6"/>
    </g>`, '#A96FD6', '#7C4DA0'),

  maranta: wrap('Маранта', `
    <g stroke="#2B6E3C" stroke-width="3" fill="none">
      <path d="M100 150 C96 124 88 108 78 96"/><path d="M104 150 C112 122 128 108 142 98"/>
    </g>
    <g>
      <ellipse cx="70" cy="78" rx="26" ry="18" fill="#1F5E33" transform="rotate(-24 70 78)"/>
      <path d="M52 86 C62 70 84 64 96 74" stroke="#E8496A" stroke-width="2" fill="none"/>
      <path d="M60 90 C70 78 86 74 98 82" stroke="#F0567E" stroke-width="1.5" fill="none"/>
      <ellipse cx="142" cy="82" rx="26" ry="18" fill="#2E9E52" transform="rotate(22 142 82)"/>
      <path d="M124 90 C136 74 156 70 166 82" stroke="#E8496A" stroke-width="2" fill="none"/>
    </g>`, '#E2795B', '#C05B40'),

  strelitzia: wrap('Стрелиция', `
    <path d="M70 148 C60 110 78 70 110 48 C96 78 88 112 92 150 Z" fill="#1F7A3D"/>
    <path d="M92 150 C100 110 130 78 162 62 C140 90 118 120 108 150 Z" fill="#2E9E52"/>
    <g transform="translate(118 70)">
      <path d="M0 20 C-8 8 -6 -8 8 -16 C4 0 6 12 0 20 Z" fill="#F5A503"/>
      <path d="M6 16 C16 8 28 -2 36 6 C24 8 12 14 6 16 Z" fill="#3E8EDE"/>
      <path d="M4 18 C14 22 26 28 30 22 C20 20 10 18 4 18 Z" fill="#E8496A"/>
    </g>`, '#F5A503', '#DFA92E'),

  yucca: wrap('Юкка', `
    <rect x="94" y="108" width="12" height="42" rx="4" fill="#B98A5E"/>
    <g fill="#2E9E52">
      <path d="M100 112 C100 80 96 52 88 28 C98 48 104 80 104 112 Z"/>
      <path d="M100 112 C78 96 52 88 28 96 C52 100 80 108 100 116 Z"/>
      <path d="M100 112 C122 96 148 88 172 96 C148 100 120 108 100 116 Z"/>
      <path d="M98 114 C80 100 58 108 40 128 C62 120 84 118 100 122 Z"/>
      <path d="M102 114 C120 100 142 108 160 128 C138 120 116 118 100 122 Z"/>
    </g>`, '#E2795B', '#C05B40'),

  schefflera: wrap('Шеффлера', `
    <path d="M100 150 C100 124 100 104 100 88" stroke="#8A5A32" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g fill="#2E9E52">
      <ellipse cx="100" cy="52" rx="12" ry="22"/>
      <ellipse cx="78" cy="64" rx="11" ry="20" transform="rotate(-28 78 64)"/>
      <ellipse cx="122" cy="64" rx="11" ry="20" transform="rotate(28 122 64)"/>
      <ellipse cx="62" cy="84" rx="10" ry="18" transform="rotate(-48 62 84)"/>
      <ellipse cx="138" cy="84" rx="10" ry="18" transform="rotate(48 138 84)"/>
      <ellipse cx="100" cy="78" rx="10" ry="16"/>
    </g>`, '#4FA3E0', '#3579B5'),

  croton: wrap('Кротон', `
    <g stroke="#8A5A32" stroke-width="3" fill="none">
      <path d="M100 150 C98 124 96 108 94 94"/><path d="M96 120 C78 112 64 108 50 112"/>
      <path d="M102 116 C120 106 138 104 154 112"/>
    </g>
    <path d="M94 94 C74 84 64 60 82 44 C96 32 112 48 108 66 C116 48 136 52 132 74 C128 92 110 100 94 94 Z" fill="#E8496A"/>
    <path d="M50 112 C36 100 36 78 52 70 C66 64 74 82 66 96 C74 84 86 92 78 108 C70 120 58 120 50 112 Z" fill="#F5A503"/>
    <path d="M154 112 C168 98 166 76 148 70 C134 66 128 86 138 98 C130 88 118 98 126 112 C134 124 148 122 154 112 Z" fill="#2E9E52"/>
    <path d="M94 70 C100 60 108 62 106 74" stroke="#F5C64F" stroke-width="3" fill="none"/>`, '#F5A503', '#DFA92E'),

  'fern-boston': wrap('Папоротник бостонский', `
    <g stroke="#1F7A3D" stroke-width="2" fill="none" stroke-linecap="round">
      <path d="M100 148 C86 120 64 100 36 96"/><path d="M100 148 C114 120 136 100 164 96"/>
      <path d="M100 148 C90 116 74 90 52 68"/><path d="M100 148 C110 116 126 90 148 68"/>
      <path d="M100 148 C96 112 90 82 82 52"/><path d="M100 148 C104 112 110 82 118 52"/>
    </g>
    <g stroke="#2E9E52" stroke-width="7" stroke-dasharray="2 5" fill="none" stroke-linecap="round">
      <path d="M100 148 C86 120 64 100 36 96"/><path d="M100 148 C114 120 136 100 164 96"/>
      <path d="M100 148 C90 116 74 90 52 68"/><path d="M100 148 C110 116 126 90 148 68"/>
      <path d="M100 148 C96 112 90 82 82 52"/><path d="M100 148 C104 112 110 82 118 52"/>
    </g>`, '#E2795B', '#C05B40'),

  ivy: wrap('Плющ', `
    <path d="M70 150 C78 120 96 100 120 78 C136 64 150 48 158 32" stroke="#8A5A32" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g fill="#2E9E52">
      <path d="M118 86 C100 80 92 62 104 50 C114 42 128 52 124 66 C130 52 144 56 140 70 C136 84 126 90 118 86 Z"/>
      <path d="M142 58 C128 52 124 36 136 28 C146 22 156 34 150 46 C156 36 168 40 164 52 C158 64 148 64 142 58 Z"/>
      <path d="M96 112 C80 106 74 88 86 78 C96 70 108 82 102 94 C108 82 120 88 114 102 C106 116 100 116 96 112 Z"/>
    </g>`, '#4FA3E0', '#3579B5'),

  echeveria: wrap('Эхеверия', `
    <g fill="#7FB531">
      <ellipse cx="100" cy="118" rx="18" ry="28" transform="rotate(0 100 118)"/>
      <ellipse cx="100" cy="118" rx="16" ry="26" transform="rotate(45 100 118)"/>
      <ellipse cx="100" cy="118" rx="16" ry="26" transform="rotate(90 100 118)"/>
      <ellipse cx="100" cy="118" rx="16" ry="26" transform="rotate(135 100 118)"/>
    </g>
    <g fill="#C9E265">
      <ellipse cx="100" cy="116" rx="10" ry="16" transform="rotate(22 100 116)"/>
      <ellipse cx="100" cy="116" rx="10" ry="16" transform="rotate(112 100 116)"/>
    </g>
    <circle cx="100" cy="114" r="8" fill="#EAF6DF"/>`, '#F5C64F', '#DFA92E'),

  jade: wrap('Толстянка', `
    <path d="M100 150 C98 128 96 112 100 98" stroke="#8A5A32" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M100 112 C84 108 70 100 66 90" stroke="#8A5A32" stroke-width="4" fill="none"/>
    <path d="M100 108 C116 100 130 96 138 86" stroke="#8A5A32" stroke-width="4" fill="none"/>
    <g fill="#3E8E4F">
      <ellipse cx="62" cy="78" rx="14" ry="10" transform="rotate(-20 62 78)"/>
      <ellipse cx="78" cy="70" rx="14" ry="10" transform="rotate(16 78 70)"/>
      <ellipse cx="140" cy="74" rx="14" ry="10" transform="rotate(24 140 74)"/>
      <ellipse cx="124" cy="66" rx="13" ry="9" transform="rotate(-10 124 66)"/>
      <ellipse cx="100" cy="58" rx="12" ry="9"/>
    </g>`, '#E2795B', '#C05B40'),

  kalanchoe: wrap('Каланхоэ', `
    <g fill="#2E9E52">
      <ellipse cx="78" cy="120" rx="16" ry="22"/><ellipse cx="122" cy="120" rx="16" ry="22"/>
      <ellipse cx="100" cy="108" rx="14" ry="20"/>
    </g>
    <g fill="#F0567E">
      <circle cx="70" cy="78" r="7"/><circle cx="86" cy="66" r="7"/><circle cx="100" cy="58" r="8"/>
      <circle cx="116" cy="66" r="7"/><circle cx="132" cy="78" r="7"/><circle cx="84" cy="86" r="6"/><circle cx="116" cy="86" r="6"/>
    </g>
    <g fill="#FBD0DA">
      <circle cx="100" cy="58" r="3"/><circle cx="86" cy="66" r="2.5"/><circle cx="116" cy="66" r="2.5"/>
    </g>`, '#F0567E', '#C24A6B'),

  pilea: wrap('Пилея', `
    <g stroke="#2B6E3C" stroke-width="3" fill="none">
      <path d="M100 150 C100 128 100 112 100 98"/><path d="M100 124 C82 116 68 112 54 116"/>
      <path d="M100 118 C118 108 136 106 150 112"/>
    </g>
    <g fill="#57C878">
      <circle cx="100" cy="78" r="22"/><circle cx="54" cy="108" r="16"/><circle cx="150" cy="104" r="16"/>
    </g>
    <g fill="#2E9E52">
      <circle cx="100" cy="78" r="6"/><circle cx="54" cy="108" r="4"/><circle cx="150" cy="104" r="4"/>
    </g>`, '#4FA3E0', '#3579B5'),

  'rubber-plant': wrap('Фикус каучуконосный', `
    <path d="M100 150 C98 124 96 108 100 92" stroke="#8A5A32" stroke-width="6" fill="none" stroke-linecap="round"/>
    <g fill="#1F5E33">
      <ellipse cx="100" cy="62" rx="28" ry="36"/>
      <ellipse cx="70" cy="108" rx="20" ry="26" transform="rotate(-18 70 108)"/>
    </g>
    <path d="M100 40 C108 58 108 78 100 92" stroke="#57C878" stroke-width="3" fill="none"/>
    <path d="M86 48 C92 40 108 36 116 44" stroke="#C9E265" stroke-width="3" fill="none" stroke-linecap="round"/>`, '#E2795B', '#C05B40'),

  'palm-areca': wrap('Арека', `
    <path d="M96 150 C94 120 92 96 90 78 M104 150 C106 120 108 96 110 78" stroke="#B98A5E" stroke-width="4" fill="none"/>
    <g stroke="#2E9E52" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M90 78 C70 70 48 74 28 88"/><path d="M90 78 C72 60 50 52 30 56"/>
      <path d="M90 78 C78 52 70 32 74 16"/><path d="M110 78 C130 70 152 74 172 88"/>
      <path d="M110 78 C128 60 150 52 170 56"/><path d="M110 78 C122 52 130 32 126 16"/>
    </g>
    <g stroke="#57C878" stroke-width="6" stroke-dasharray="1 6" fill="none" stroke-linecap="round">
      <path d="M90 78 C70 70 48 74 28 88"/><path d="M110 78 C130 70 152 74 172 88"/>
      <path d="M90 78 C72 60 50 52 30 56"/><path d="M110 78 C128 60 150 52 170 56"/>
    </g>`, '#F5C64F', '#DFA92E'),

  citrus: wrap('Цитрус', `
    <path d="M100 150 C98 128 96 112 100 96" stroke="#8A5A32" stroke-width="6" fill="none" stroke-linecap="round"/>
    <g fill="#2E9E52">
      <circle cx="100" cy="70" r="28"/><circle cx="72" cy="88" r="18"/><circle cx="128" cy="88" r="18"/>
    </g>
    <g fill="#F5A503">
      <circle cx="88" cy="64" r="7"/><circle cx="112" cy="78" r="6"/><circle cx="78" cy="92" r="5"/>
    </g>
    <g fill="#EAF6DF">
      <ellipse cx="92" cy="56" rx="4" ry="7" transform="rotate(-20 92 56)"/>
    </g>`, '#F5A503', '#DFA92E'),

  geranium: wrap('Герань', `
    <g fill="#2B6E3C">
      <circle cx="72" cy="118" r="16"/><circle cx="128" cy="118" r="16"/><circle cx="100" cy="108" r="14"/>
    </g>
    <g stroke="#1F7A3D" stroke-width="2" fill="none">
      <path d="M64 110 h16 M120 110 h16 M94 100 h12"/>
    </g>
    <g fill="#E8496A">
      <circle cx="78" cy="70" r="8"/><circle cx="96" cy="60" r="9"/><circle cx="114" cy="70" r="8"/>
      <circle cx="86" cy="84" r="7"/><circle cx="108" cy="84" r="7"/>
    </g>`, '#E8496A', '#C24A6B'),

  'spathiphyllum-mini': wrap('Спатифиллум мини', `
    <g stroke="#3E8E4F" stroke-width="3" fill="none">
      <path d="M86 150 C80 128 74 112 70 98"/><path d="M114 150 C120 128 126 112 130 98"/>
    </g>
    <g fill="#57C878">
      <ellipse cx="68" cy="84" rx="14" ry="20" transform="rotate(-12 68 84)"/>
      <ellipse cx="132" cy="84" rx="14" ry="20" transform="rotate(12 132 84)"/>
    </g>
    <path d="M100 120 C90 108 92 88 106 82 C112 96 108 114 100 120 Z" fill="#FDFDF5"/>
    <path d="M104 96 v-14" stroke="#F5A503" stroke-width="2"/>`, '#F5C64F', '#DFA92E'),

  oxalis: wrap('Кислица', `
    <g stroke="#7C4DA0" stroke-width="3" fill="none">
      <path d="M100 150 C100 124 100 108 100 96"/><path d="M100 120 C80 112 64 108 50 112"/>
      <path d="M100 116 C122 106 140 108 154 118"/>
    </g>
    <g fill="#6B3D91">
      <path d="M100 96 C88 84 86 68 100 64 C114 68 112 84 100 96 Z"/>
      <path d="M100 96 C86 96 74 84 78 72 C90 76 98 88 100 96 Z"/>
      <path d="M100 96 C114 96 126 84 122 72 C110 76 102 88 100 96 Z"/>
      <path d="M50 112 C38 100 38 84 52 80 C60 90 58 104 50 112 Z"/>
      <path d="M50 112 C40 114 30 104 34 92 C44 96 50 106 50 112 Z"/>
      <path d="M50 112 C58 110 66 100 62 88 C54 94 50 104 50 112 Z"/>
      <path d="M154 118 C166 106 164 90 150 88 C146 100 148 112 154 118 Z"/>
      <path d="M154 118 C144 120 136 108 140 96 C148 100 154 110 154 118 Z"/>
      <path d="M154 118 C162 116 170 104 164 92 C156 98 152 110 154 118 Z"/>
    </g>`, '#A96FD6', '#7C4DA0'),

  'asparagus-fern': wrap('Аспарагус', `
    <g stroke="#3E8E4F" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M100 150 C96 120 84 96 64 78"/><path d="M100 150 C104 118 120 96 142 80"/>
      <path d="M100 150 C100 116 100 90 100 66"/>
    </g>
    <g fill="#57C878">
      <circle cx="64" cy="74" r="16"/><circle cx="52" cy="88" r="8"/><circle cx="76" cy="64" r="7"/>
      <circle cx="142" cy="76" r="16"/><circle cx="154" cy="90" r="8"/><circle cx="130" cy="64" r="7"/>
      <circle cx="100" cy="58" r="14"/><circle cx="88" cy="48" r="6"/><circle cx="112" cy="46" r="6"/>
    </g>`, '#4FA3E0', '#3579B5'),

  other: wrap('Другое', `
    <path d="M100 150 C100 124 100 104 100 88" stroke="#1F7A3D" stroke-width="4" fill="none" stroke-linecap="round"/>
    <g fill="#2E9E52">
      <ellipse cx="100" cy="70" rx="16" ry="26"/>
      <ellipse cx="74" cy="96" rx="18" ry="26" transform="rotate(-28 74 96)"/>
      <ellipse cx="126" cy="96" rx="18" ry="26" transform="rotate(28 126 96)"/>
    </g>
    <path d="M100 52 C108 64 108 78 100 90" stroke="#57C878" stroke-width="2.5" fill="none"/>`, '#A96FD6', '#7C4DA0')
};

const LABELS = {
  zamioculcas: 'Замиокулькас', dracaena: 'Драцена', ficus: 'Фикус', calathea: 'Калатея',
  anthurium: 'Антуриум', caladium: 'Каладиум', narcissus: 'Нарцисс',
  'chlorophytum-lemon': 'Хлорофитум', nephrolepis: 'Нефролепис', adenium: 'Адениум',
  monstera: 'Монстера', pothos: 'Эпипремнум', aloe: 'Алоэ', sansevieria: 'Сансевиерия',
  philodendron: 'Филодендрон', begonia: 'Бегония', orchid: 'Орхидея',
  'cactus-barrel': 'Эхинокактус', 'cactus-opuntia': 'Опунция', lavender: 'Лаванда',
  basil: 'Базилик', mint: 'Мята', rosemary: 'Розмарин', tulip: 'Тюльпан', violet: 'Фиалка',
  peperomia: 'Пеперомия', hoya: 'Хойя', bromeliad: 'Гузмания', spathiphyllum: 'Спатифиллум',
  dieffenbachia: 'Диффенбахия', aglaonema: 'Аглаонема', tradescantia: 'Традесканция',
  maranta: 'Маранта', strelitzia: 'Стрелиция', yucca: 'Юкка', schefflera: 'Шеффлера',
  croton: 'Кротон', 'fern-boston': 'Папоротник', ivy: 'Плющ', echeveria: 'Эхеверия',
  jade: 'Толстянка', kalanchoe: 'Каланхоэ', pilea: 'Пилея', 'rubber-plant': 'Каучуконос',
  'palm-areca': 'Арека', citrus: 'Цитрус', geranium: 'Герань',
  'spathiphyllum-mini': 'Спатифиллум', oxalis: 'Кислица',   'asparagus-fern': 'Аспарагус',
  other: 'Другое'
};

const pet = (label, inner) =>
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">${inner}</svg>`;

const PETS = {
  hamster: null,
  'guinea-pig': pet('Морская свинка', `
    <ellipse cx="100" cy="176" rx="78" ry="12" fill="#F1DFC0"/>
    <ellipse cx="52" cy="78" rx="20" ry="24" fill="#A67C52"/>
    <ellipse cx="156" cy="78" rx="20" ry="24" fill="#A67C52"/>
    <ellipse cx="52" cy="84" rx="10" ry="13" fill="#E8C4B0"/>
    <ellipse cx="156" cy="84" rx="10" ry="13" fill="#E8C4B0"/>
    <ellipse cx="104" cy="124" rx="58" ry="38" fill="#C4A57A"/>
    <ellipse cx="118" cy="138" rx="28" ry="16" fill="#FFF3E0"/>
    <circle cx="86" cy="112" r="5.5" fill="#2A1E14"/>
    <circle cx="122" cy="112" r="5.5" fill="#2A1E14"/>
    <circle cx="88" cy="110" r="1.7" fill="#fff"/>
    <circle cx="124" cy="110" r="1.7" fill="#fff"/>
    <ellipse cx="104" cy="124" rx="6" ry="4" fill="#E8837E"/>
    <ellipse cx="78" cy="154" rx="10" ry="6" fill="#A67C52"/>
    <ellipse cx="138" cy="154" rx="10" ry="6" fill="#A67C52"/>`),
  rabbit: pet('Кролик', `
    <ellipse cx="100" cy="176" rx="70" ry="12" fill="#F1DFC0"/>
    <ellipse cx="78" cy="48" rx="14" ry="36" fill="#E8D4C8"/><ellipse cx="78" cy="52" rx="7" ry="24" fill="#F8C9C4"/>
    <ellipse cx="122" cy="48" rx="14" ry="36" fill="#E8D4C8"/><ellipse cx="122" cy="52" rx="7" ry="24" fill="#F8C9C4"/>
    <ellipse cx="100" cy="118" rx="48" ry="42" fill="#F3E4D8"/>
    <ellipse cx="100" cy="132" rx="28" ry="22" fill="#FFF8F2"/>
    <circle cx="82" cy="112" r="5" fill="#2A1E14"/><circle cx="118" cy="112" r="5" fill="#2A1E14"/>
    <ellipse cx="100" cy="126" rx="5" ry="4" fill="#E8837E"/>
    <path d="M148 130 C170 150 150 168 128 156" stroke="#E8D4C8" stroke-width="10" fill="none" stroke-linecap="round"/>`),
  cat: pet('Кошка', `
    <ellipse cx="100" cy="176" rx="72" ry="12" fill="#E7D7C3"/>
    <path d="M62 96 L46 36 L86 78 Z" fill="#7B8FA1"/><path d="M138 96 L154 36 L114 78 Z" fill="#7B8FA1"/>
    <path d="M70 88 L58 48 L82 76 Z" fill="#F3C1C8"/><path d="M130 88 L142 48 L118 76 Z" fill="#F3C1C8"/>
    <ellipse cx="100" cy="118" rx="50" ry="44" fill="#7B8FA1"/>
    <ellipse cx="100" cy="132" rx="24" ry="22" fill="#E8EEF2"/>
    <path d="M86 124 L100 134 L114 124" fill="none" stroke="#2A1E14" stroke-width="2"/>
    <circle cx="82" cy="110" r="5" fill="#2A1E14"/><circle cx="118" cy="110" r="5" fill="#2A1E14"/>
    <path d="M64 118 H42 M66 128 H46 M136 118 H158 M134 128 H154" stroke="#5C6B78" stroke-width="2" stroke-linecap="round"/>
    <path d="M146 128 C176 118 178 160 140 162" stroke="#7B8FA1" stroke-width="12" fill="none" stroke-linecap="round"/>`),
  dog: pet('Собака', `
    <ellipse cx="100" cy="176" rx="74" ry="12" fill="#E7D3B8"/>
    <ellipse cx="52" cy="108" rx="22" ry="30" fill="#8A5A32"/><ellipse cx="148" cy="108" rx="22" ry="30" fill="#8A5A32"/>
    <ellipse cx="100" cy="112" rx="48" ry="46" fill="#C48A52"/>
    <ellipse cx="100" cy="132" rx="28" ry="24" fill="#F5E6D3"/>
    <ellipse cx="100" cy="124" rx="16" ry="12" fill="#E7C8A4"/>
    <ellipse cx="100" cy="128" rx="7" ry="5" fill="#2A1E14"/>
    <circle cx="82" cy="104" r="5" fill="#2A1E14"/><circle cx="118" cy="104" r="5" fill="#2A1E14"/>
    <path d="M150 140 C172 156 160 176 136 168" stroke="#C48A52" stroke-width="10" fill="none" stroke-linecap="round"/>`),
  parrot: pet('Волнистый попугай', `
    <ellipse cx="100" cy="176" rx="70" ry="10" fill="#E7D7C3"/>
    <path d="M70 150 h60" stroke="#8A5A32" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="108" cy="108" rx="36" ry="28" fill="#4FA3E0"/>
    <circle cx="78" cy="92" r="22" fill="#57C878"/>
    <path d="M58 96 L28 88 L58 108 Z" fill="#F5A503"/>
    <circle cx="70" cy="86" r="4" fill="#2A1E14"/><circle cx="72" cy="85" r="1.4" fill="#fff"/>
    <path d="M128 96 C156 80 168 108 140 120" fill="#3E8EDE"/>
    <path d="M120 128 C110 150 96 156 90 148" stroke="#F5A503" stroke-width="4" fill="none"/>
    <g stroke="#1F5E33" stroke-width="2"><path d="M86 150 v16 M118 150 v16"/></g>`),
  budgie: pet('Неразлучник', `
    <ellipse cx="100" cy="176" rx="64" ry="10" fill="#E7D7C3"/>
    <path d="M78 154 h44" stroke="#8A5A32" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="104" cy="112" rx="30" ry="24" fill="#57C878"/>
    <circle cx="78" cy="100" r="18" fill="#F0567E"/>
    <path d="M62 104 L36 98 L62 114 Z" fill="#F5A503"/>
    <circle cx="72" cy="94" r="3.5" fill="#2A1E14"/>
    <path d="M124 104 C146 92 150 116 128 122" fill="#2E9E52"/>
    <path d="M96 132 C90 148 82 152 78 146" stroke="#F5A503" stroke-width="3" fill="none"/>`),
  canary: pet('Канарейка', `
    <ellipse cx="100" cy="176" rx="60" ry="10" fill="#F1DFC0"/>
    <path d="M82 156 h36" stroke="#8A5A32" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="104" cy="112" rx="26" ry="20" fill="#F5D547"/>
    <circle cx="80" cy="100" r="16" fill="#F2C230"/>
    <path d="M66 104 L44 100 L66 112 Z" fill="#E07A2E"/>
    <circle cx="74" cy="94" r="3" fill="#2A1E14"/>
    <path d="M122 104 C140 94 142 116 122 118" fill="#E0B820"/>`),
  goldfish: pet('Золотая рыбка', `
    <ellipse cx="96" cy="108" rx="52" ry="30" fill="#F2A230"/>
    <path d="M142 108 L178 78 L170 108 L178 138 Z" fill="#E07A2E"/>
    <path d="M70 82 L96 70 L100 96 Z" fill="#E07A2E"/>
    <path d="M78 134 L100 122 L96 146 Z" fill="#F5C64F"/>
    <circle cx="62" cy="102" r="5" fill="#2A1E14"/><circle cx="64" cy="100" r="1.6" fill="#fff"/>
    <path d="M48 108 q8 6 0 12" stroke="#C05B40" stroke-width="2" fill="none"/>`),
  betta: pet('Петушок', `
    <ellipse cx="108" cy="108" rx="36" ry="22" fill="#E8496A"/>
    <path d="M78 108 C40 70 28 108 36 140 C52 120 70 124 78 108 Z" fill="#F0567E"/>
    <path d="M100 88 C80 48 120 40 130 78 Z" fill="#A96FD6"/>
    <path d="M108 128 C96 160 140 156 136 120 Z" fill="#3E8EDE"/>
    <circle cx="128" cy="102" r="4" fill="#2A1E14"/>`),
  turtle: pet('Черепаха', `
    <ellipse cx="100" cy="176" rx="70" ry="10" fill="#E7D3B8"/>
    <ellipse cx="78" cy="132" rx="14" ry="10" fill="#6B8F71"/><ellipse cx="122" cy="132" rx="14" ry="10" fill="#6B8F71"/>
    <ellipse cx="70" cy="108" rx="12" ry="9" fill="#6B8F71"/><ellipse cx="130" cy="108" rx="12" ry="9" fill="#6B8F71"/>
    <ellipse cx="100" cy="112" rx="48" ry="36" fill="#3E8E4F"/>
    <path d="M70 100 h60 M78 116 h44 M86 130 h28 M100 84 v52 M78 96 l44 40 M122 96 l-44 40" stroke="#1F5E33" stroke-width="2" fill="none"/>
    <ellipse cx="148" cy="96" rx="16" ry="12" fill="#6B8F71"/>
    <circle cx="156" cy="92" r="2.4" fill="#2A1E14"/>`),
  chinchilla: pet('Шиншилла', `
    <ellipse cx="100" cy="176" rx="70" ry="12" fill="#E4E0DC"/>
    <ellipse cx="62" cy="70" rx="22" ry="28" fill="#B0B8C0"/><ellipse cx="62" cy="74" rx="12" ry="16" fill="#F4C7C4"/>
    <ellipse cx="138" cy="70" rx="22" ry="28" fill="#B0B8C0"/><ellipse cx="138" cy="74" rx="12" ry="16" fill="#F4C7C4"/>
    <ellipse cx="100" cy="118" rx="46" ry="42" fill="#C5CED6"/>
    <ellipse cx="100" cy="132" rx="26" ry="22" fill="#F4F7F8"/>
    <circle cx="84" cy="110" r="5" fill="#2A1E14"/><circle cx="116" cy="110" r="5" fill="#2A1E14"/>
    <ellipse cx="148" cy="150" rx="16" ry="22" fill="#9AA3AD"/>`),
  ferret: pet('Хорёк', `
    <ellipse cx="100" cy="176" rx="78" ry="10" fill="#E7D3B8"/>
    <ellipse cx="118" cy="118" rx="62" ry="22" fill="#C4A882"/>
    <ellipse cx="124" cy="124" rx="40" ry="12" fill="#F0E4D0"/>
    <ellipse cx="52" cy="104" rx="24" ry="16" fill="#C4A882"/>
    <circle cx="40" cy="98" r="4" fill="#2A1E14"/>
    <ellipse cx="34" cy="96" rx="8" ry="6" fill="#F3C1C8"/>
    <path d="M168 112 C186 100 188 124 170 128" fill="#8A6A42"/>
    <ellipse cx="70" cy="132" rx="8" ry="5" fill="#8A6A42"/><ellipse cx="150" cy="134" rx="8" ry="5" fill="#8A6A42"/>`),
  gerbil: pet('Песчанка', `
    <ellipse cx="100" cy="176" rx="66" ry="10" fill="#F1DFC0"/>
    <ellipse cx="112" cy="128" rx="40" ry="24" fill="#D4B484"/>
    <ellipse cx="122" cy="136" rx="18" ry="12" fill="#FFF0D8"/>
    <circle cx="74" cy="112" r="18" fill="#E2C39A"/>
    <ellipse cx="62" cy="92" rx="7" ry="11" fill="#D4B484"/>
    <ellipse cx="86" cy="90" rx="7" ry="11" fill="#D4B484"/>
    <circle cx="68" cy="110" r="3.2" fill="#2A1E14"/>
    <circle cx="82" cy="110" r="3.2" fill="#2A1E14"/>
    <circle cx="69" cy="109" r="1.1" fill="#fff"/>
    <circle cx="83" cy="109" r="1.1" fill="#fff"/>
    <ellipse cx="75" cy="118" rx="3" ry="2.2" fill="#E8837E"/>
    <path d="M146 128 C168 122 186 138 172 154" stroke="#C4A06A" stroke-width="4" fill="none" stroke-linecap="round"/>`),
  rat: pet('Крыса', `
    <ellipse cx="100" cy="176" rx="70" ry="10" fill="#E4D8D2"/>
    <ellipse cx="108" cy="116" rx="46" ry="30" fill="#9A8A82"/>
    <ellipse cx="118" cy="124" rx="24" ry="16" fill="#D8D0CC"/>
    <ellipse cx="62" cy="112" rx="22" ry="14" fill="#9A8A82"/>
    <circle cx="52" cy="108" r="3" fill="#E8837E"/><circle cx="70" cy="106" r="4" fill="#2A1E14"/>
    <ellipse cx="48" cy="96" rx="10" ry="14" fill="#B0A29A"/><ellipse cx="74" cy="92" rx="9" ry="12" fill="#B0A29A"/>
    <path d="M148 124 C176 130 186 160 160 168" stroke="#6A5A52" stroke-width="5" fill="none" stroke-linecap="round"/>`),
  gecko: pet('Геккон', `
    <ellipse cx="100" cy="176" rx="60" ry="8" fill="#F3E6C4"/>
    <ellipse cx="100" cy="118" rx="28" ry="18" fill="#F0C14B"/>
    <circle cx="100" cy="86" r="22" fill="#F0C14B"/>
    <circle cx="92" cy="82" r="4" fill="#2A1E14"/><circle cx="108" cy="82" r="4" fill="#2A1E14"/>
    <path d="M100 136 C108 156 96 170 88 160" stroke="#E0B020" stroke-width="8" fill="none" stroke-linecap="round"/>
    <g stroke="#C9A020" stroke-width="6" fill="none" stroke-linecap="round">
      <path d="M78 108 L52 96"/><path d="M78 124 L50 128"/><path d="M122 108 L148 96"/><path d="M122 124 L150 128"/>
    </g>
    <g fill="#E07A2E"><circle cx="90" cy="100" r="3"/><circle cx="110" cy="112" r="3"/><circle cx="96" cy="124" r="2.5"/></g>`),
  'corn-snake': pet('Кукурузная змея', `
    <path d="M36 150 C56 150 62 124 84 124 C112 124 108 156 136 148 C164 140 158 96 132 88 C100 78 108 112 84 100 C60 88 48 52 74 40 C92 32 108 48 100 62" stroke="#C97B4A" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M48 140 C66 138 74 128 88 130 M120 140 C136 136 150 128 158 116 M96 92 C108 100 116 96 124 104" stroke="#F5C64F" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="108" cy="52" r="12" fill="#C97B4A"/>
    <circle cx="104" cy="48" r="2.2" fill="#2A1E14"/>
    <path d="M96 56 q-8 2 -6 8" stroke="#E85D4C" stroke-width="2" fill="none"/>`),
  hedgehog: pet('Ёж', `
    <ellipse cx="100" cy="176" rx="70" ry="10" fill="#E7D7C3"/>
    <ellipse cx="108" cy="118" rx="52" ry="36" fill="#B8A99A"/>
    <g stroke="#7A6A5A" stroke-width="3" stroke-linecap="round">
      <path d="M70 100 l-10 -16 M84 90 l-4 -18 M100 84 l0 -18 M116 90 l6 -18 M132 100 l12 -14 M78 112 l-16 -8 M140 114 l16 -6"/>
    </g>
    <ellipse cx="64" cy="124" rx="22" ry="16" fill="#E8E0D8"/>
    <circle cx="56" cy="120" r="3" fill="#2A1E14"/><ellipse cx="46" cy="128" rx="5" ry="3" fill="#2A1E14"/>`),
  mouse: pet('Мышь', `
    <ellipse cx="100" cy="176" rx="60" ry="10" fill="#E8E4E0"/>
    <ellipse cx="104" cy="120" rx="36" ry="26" fill="#C8C8C8"/>
    <ellipse cx="112" cy="128" rx="18" ry="14" fill="#F4F4F4"/>
    <circle cx="78" cy="108" r="16" fill="#D0D0D0"/>
    <circle cx="66" cy="92" r="12" fill="#E8E8E8"/><circle cx="92" cy="90" r="12" fill="#E8E8E8"/>
    <circle cx="66" cy="92" r="6" fill="#F4C7C4"/><circle cx="92" cy="90" r="6" fill="#F4C7C4"/>
    <circle cx="72" cy="106" r="3" fill="#2A1E14"/>
    <path d="M136 128 C160 124 178 148 156 160" stroke="#A0A0A0" stroke-width="3" fill="none"/>`),
  degu: pet('Дегу', `
    <ellipse cx="100" cy="176" rx="68" ry="10" fill="#E7D3B8"/>
    <ellipse cx="100" cy="116" rx="40" ry="30" fill="#A67C52"/>
    <ellipse cx="108" cy="124" rx="22" ry="16" fill="#E8D4C0"/>
    <circle cx="72" cy="104" r="16" fill="#C4A07A"/>
    <ellipse cx="60" cy="88" rx="10" ry="14" fill="#A67C52"/><ellipse cx="84" cy="86" rx="10" ry="14" fill="#A67C52"/>
    <circle cx="66" cy="100" r="3.5" fill="#2A1E14"/>
    <path d="M136 124 C156 112 176 96 168 78 C160 92 150 104 140 112" fill="#8A6236"/>
    <ellipse cx="78" cy="142" rx="8" ry="5" fill="#7A5A3A"/><ellipse cx="120" cy="144" rx="8" ry="5" fill="#7A5A3A"/>`)
};

const lines = [
  '// Иллюстрации каталога. Пересборка: node scripts/build-gallery.js',
  '(function () {',
  '  const extra = {'
];
for (const [id, svg] of Object.entries(PLANTS)) {
  lines.push(`    ${JSON.stringify(id)}: \`${svg}\`,`);
}
lines.push('  };');
lines.push('  for (const [k, v] of Object.entries(extra)) PLANT_ART[k] = v;');
lines.push('  const PET_KIND_ART = {');
lines.push('    hamster: PET_ART.frodo,');
for (const [kind, svg] of Object.entries(PETS)) {
  if (kind === 'hamster') continue;
  lines.push(`    ${JSON.stringify(kind)}: \`${svg}\`,`);
}
lines.push('  };');
lines.push(`  window.PLANT_LABELS = ${JSON.stringify(LABELS)};`);
lines.push('  window.PLANT_GALLERY_IDS = Object.keys(window.PLANT_LABELS);');
lines.push('  window.plantArtHtml = (p) => PLANT_ART[p.artId || p.id] || "";');
lines.push('  window.petArtHtml = (pet) => PET_ART[pet.id] || PET_KIND_ART[pet.kind] || "";');
lines.push('})();');
lines.push('');

const out = path.join(__dirname, '../public/gallery.js');
fs.writeFileSync(out, lines.join('\n'), 'utf8');
console.log('plants', Object.keys(PLANTS).length, 'pets', Object.keys(PETS).length);
