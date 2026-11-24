// Плоские SVG-иллюстрации растений. Ключ — id растения из данных сервера.
const PLANT_ART = {

  zamioculcas: `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Замиокулькас">
    <g stroke="#1F7A3D" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M100 150 C 98 110, 96 80, 88 42"/>
      <path d="M108 150 C 114 112, 122 84, 138 55"/>
      <path d="M92 150 C 82 118, 68 92, 52 70"/>
    </g>
    <g fill="#2E9E52">
      <ellipse cx="84" cy="52" rx="9" ry="15" transform="rotate(-18 84 52)"/>
      <ellipse cx="97" cy="66" rx="9" ry="15" transform="rotate(14 97 66)"/>
      <ellipse cx="83" cy="82" rx="9" ry="15" transform="rotate(-22 83 82)"/>
      <ellipse cx="99" cy="97" rx="9" ry="15" transform="rotate(16 99 97)"/>
      <ellipse cx="86" cy="114" rx="9" ry="15" transform="rotate(-18 86 114)"/>
      <ellipse cx="134" cy="62" rx="8" ry="14" transform="rotate(38 134 62)"/>
      <ellipse cx="120" cy="78" rx="8" ry="14" transform="rotate(6 120 78)"/>
      <ellipse cx="130" cy="96" rx="8" ry="14" transform="rotate(34 130 96)"/>
      <ellipse cx="114" cy="112" rx="8" ry="14" transform="rotate(4 114 112)"/>
      <ellipse cx="56" cy="76" rx="8" ry="13" transform="rotate(-48 56 76)"/>
      <ellipse cx="70" cy="90" rx="8" ry="13" transform="rotate(-20 70 90)"/>
      <ellipse cx="60" cy="106" rx="8" ry="13" transform="rotate(-44 60 106)"/>
      <ellipse cx="76" cy="120" rx="8" ry="13" transform="rotate(-14 76 120)"/>
    </g>
    <g fill="#57C878">
      <ellipse cx="88" cy="46" rx="4" ry="8" transform="rotate(-18 88 46)"/>
      <ellipse cx="138" cy="58" rx="3.5" ry="7" transform="rotate(38 138 58)"/>
      <ellipse cx="52" cy="72" rx="3.5" ry="7" transform="rotate(-48 52 72)"/>
    </g>
    <path d="M64 150 h72 l-8 34 a8 8 0 0 1 -8 6 h-40 a8 8 0 0 1 -8 -6 z" fill="#E2795B"/>
    <rect x="58" y="144" width="84" height="14" rx="7" fill="#C05B40"/>
  </svg>`,

  dracaena: `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Драцена">
    <rect x="94" y="88" width="12" height="62" rx="5" fill="#B98A5E"/>
    <path d="M96 118 h8 M95 132 h10" stroke="#96683F" stroke-width="3" stroke-linecap="round"/>
    <g stroke-linecap="round" fill="none">
      <g stroke="#2E9E52" stroke-width="9">
        <path d="M100 92 C 100 66, 100 52, 100 34"/>
        <path d="M100 92 C 88 72, 74 60, 52 48"/>
        <path d="M100 92 C 112 72, 126 60, 148 48"/>
        <path d="M100 92 C 82 82, 62 80, 38 84"/>
        <path d="M100 92 C 118 82, 138 80, 162 84"/>
        <path d="M100 92 C 92 78, 80 66, 68 38"/>
        <path d="M100 92 C 108 78, 120 66, 132 38"/>
      </g>
      <g stroke="#F0567E" stroke-width="2.5" opacity="0.85">
        <path d="M103 88 C 103 66, 103 54, 103 38"/>
        <path d="M97 86 C 87 70, 76 60, 58 50"/>
        <path d="M103 86 C 113 70, 124 60, 142 50"/>
      </g>
    </g>
    <path d="M64 150 h72 l-8 34 a8 8 0 0 1 -8 6 h-40 a8 8 0 0 1 -8 -6 z" fill="#F5C64F"/>
    <rect x="58" y="144" width="84" height="14" rx="7" fill="#DFA92E"/>
  </svg>`,

  ficus: `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Фикус Бенджамина">
    <path d="M100 150 C 98 124, 96 108, 98 88 M98 108 C 88 98, 80 92, 74 84 M99 100 C 108 92, 116 86, 124 78" stroke="#A97B50" stroke-width="6" fill="none" stroke-linecap="round"/>
    <g fill="#2E9E52">
      <circle cx="100" cy="58" r="26"/>
      <circle cx="68" cy="74" r="20"/>
      <circle cx="132" cy="74" r="20"/>
      <circle cx="84" cy="46" r="16"/>
      <circle cx="118" cy="46" r="16"/>
    </g>
    <g fill="#57C878">
      <ellipse cx="78" cy="62" rx="6" ry="10" transform="rotate(-30 78 62)"/>
      <ellipse cx="104" cy="42" rx="6" ry="10" transform="rotate(12 104 42)"/>
      <ellipse cx="126" cy="64" rx="6" ry="10" transform="rotate(34 126 64)"/>
      <ellipse cx="92" cy="76" rx="6" ry="10" transform="rotate(-8 92 76)"/>
      <ellipse cx="114" cy="70" rx="6" ry="10" transform="rotate(20 114 70)"/>
    </g>
    <g fill="#EAF6DF">
      <ellipse cx="66" cy="80" rx="4.5" ry="7.5" transform="rotate(-36 66 80)"/>
      <ellipse cx="98" cy="56" rx="4.5" ry="7.5" transform="rotate(8 98 56)"/>
      <ellipse cx="136" cy="82" rx="4.5" ry="7.5" transform="rotate(40 136 82)"/>
    </g>
    <path d="M64 150 h72 l-8 34 a8 8 0 0 1 -8 6 h-40 a8 8 0 0 1 -8 -6 z" fill="#4FA3E0"/>
    <rect x="58" y="144" width="84" height="14" rx="7" fill="#3579B5"/>
  </svg>`,

  calathea: `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Калатея Розеопикта">
    <g stroke="#7C4DA0" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M100 150 C 100 130, 100 116, 100 96"/>
      <path d="M92 150 C 80 132, 68 118, 60 100"/>
      <path d="M108 150 C 120 132, 132 118, 140 100"/>
    </g>
    <g>
      <ellipse cx="100" cy="66" rx="26" ry="34" fill="#3E8E4F"/>
      <ellipse cx="100" cy="66" rx="17" ry="25" fill="#2B6E3C"/>
      <ellipse cx="100" cy="66" rx="17" ry="25" fill="none" stroke="#F2A9C4" stroke-width="3"/>
      <path d="M100 44 v44 M88 52 l24 28 M112 52 l-24 28" stroke="#F2A9C4" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    <g transform="rotate(-32 58 80)">
      <ellipse cx="58" cy="78" rx="20" ry="27" fill="#3E8E4F"/>
      <ellipse cx="58" cy="78" rx="12.5" ry="19" fill="#2B6E3C"/>
      <ellipse cx="58" cy="78" rx="12.5" ry="19" fill="none" stroke="#F2A9C4" stroke-width="2.5"/>
      <path d="M58 61 v34" stroke="#F2A9C4" stroke-width="2" stroke-linecap="round"/>
    </g>
    <g transform="rotate(32 142 80)">
      <ellipse cx="142" cy="78" rx="20" ry="27" fill="#8E5DB5"/>
      <ellipse cx="142" cy="78" rx="12.5" ry="19" fill="#7C4DA0"/>
      <ellipse cx="142" cy="78" rx="12.5" ry="19" fill="none" stroke="#F2A9C4" stroke-width="2.5"/>
      <path d="M142 61 v34" stroke="#F2A9C4" stroke-width="2" stroke-linecap="round"/>
    </g>
    <path d="M64 150 h72 l-8 34 a8 8 0 0 1 -8 6 h-40 a8 8 0 0 1 -8 -6 z" fill="#F5C64F"/>
    <rect x="58" y="144" width="84" height="14" rx="7" fill="#DFA92E"/>
  </svg>`,

  anthurium: `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Антуриум Люксурианс">
    <g stroke="#1F5E33" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M96 150 C 94 128, 92 112, 86 92"/>
      <path d="M106 150 C 112 130, 120 114, 128 98"/>
    </g>
    <g>
      <path d="M84 92 C 60 84, 48 62, 58 42 C 66 28, 86 26, 84 44 C 82 26, 104 26, 110 42 C 118 62, 106 86, 84 92 Z" fill="#1F5E33"/>
      <path d="M84 88 C 84 70, 84 56, 84 44 M72 56 C 76 66, 80 74, 84 82 M96 56 C 92 66, 88 74, 84 82 M64 66 C 72 74, 78 80, 84 86 M104 66 C 96 74, 90 80, 84 86" stroke="#3E8E4F" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </g>
    <g>
      <path d="M128 98 C 106 88, 98 64, 110 46 C 118 34, 136 32, 134 48 C 134 32, 154 34, 158 50 C 164 70, 150 92, 128 98 Z" fill="#2B6E3C"/>
      <path d="M130 94 C 132 76, 133 62, 134 50 M120 60 C 124 70, 127 78, 130 88 M146 62 C 140 72, 135 80, 131 88" stroke="#57C878" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </g>
    <path d="M64 150 h72 l-8 34 a8 8 0 0 1 -8 6 h-40 a8 8 0 0 1 -8 -6 z" fill="#E2795B"/>
    <rect x="58" y="144" width="84" height="14" rx="7" fill="#C05B40"/>
  </svg>`,

  caladium: `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Каладиум Скарлет Флейм">
    <g stroke="#C24A6B" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M100 150 C 100 128, 100 110, 98 92"/>
      <path d="M92 150 C 78 132, 66 116, 58 98"/>
      <path d="M108 150 C 122 134, 134 120, 142 104"/>
    </g>
    <g>
      <path d="M98 90 C 72 80, 62 54, 76 36 C 86 24, 98 28, 98 42 C 98 28, 112 24, 122 36 C 136 54, 124 80, 98 90 Z" fill="#3E8E4F"/>
      <path d="M98 84 C 78 76, 70 56, 80 42 C 87 34, 96 38, 97 48 C 98 38, 108 34, 115 42 C 126 56, 118 76, 98 84 Z" fill="#E8496A"/>
      <path d="M98 82 C 98 68, 98 56, 97 46 M86 56 C 90 64, 94 70, 97 78 M110 56 C 106 64, 101 70, 98 78" stroke="#FBD0DA" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </g>
    <g transform="translate(58 98) scale(0.72) rotate(-28) translate(-98 -90)">
      <path d="M98 90 C 72 80, 62 54, 76 36 C 86 24, 98 28, 98 42 C 98 28, 112 24, 122 36 C 136 54, 124 80, 98 90 Z" fill="#3E8E4F"/>
      <path d="M98 84 C 78 76, 70 56, 80 42 C 87 34, 96 38, 97 48 C 98 38, 108 34, 115 42 C 126 56, 118 76, 98 84 Z" fill="#F0567E"/>
    </g>
    <g transform="translate(142 104) scale(0.72) rotate(28) translate(-98 -90)">
      <path d="M98 90 C 72 80, 62 54, 76 36 C 86 24, 98 28, 98 42 C 98 28, 112 24, 122 36 C 136 54, 124 80, 98 90 Z" fill="#2B6E3C"/>
      <path d="M98 84 C 78 76, 70 56, 80 42 C 87 34, 96 38, 97 48 C 98 38, 108 34, 115 42 C 126 56, 118 76, 98 84 Z" fill="#E8496A"/>
    </g>
    <path d="M64 150 h72 l-8 34 a8 8 0 0 1 -8 6 h-40 a8 8 0 0 1 -8 -6 z" fill="#4FA3E0"/>
    <rect x="58" y="144" width="84" height="14" rx="7" fill="#3579B5"/>
  </svg>`,

  narcissus: `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Нарциссы">
    <g stroke="#3E8E4F" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M96 150 C 96 122, 98 92, 100 62"/>
      <path d="M88 150 C 78 126, 68 104, 62 84"/>
      <path d="M110 150 C 120 128, 130 108, 136 80"/>
    </g>
    <g stroke="#2B6E3C" stroke-width="7" fill="none" stroke-linecap="round">
      <path d="M80 150 C 66 128, 58 108, 56 88"/>
      <path d="M120 150 C 132 130, 140 112, 144 96"/>
      <path d="M100 150 C 92 130, 88 116, 88 100"/>
    </g>
    <g fill="#FDFDF5">
      <ellipse cx="100" cy="46" rx="6.5" ry="14"/>
      <ellipse cx="100" cy="46" rx="6.5" ry="14" transform="rotate(60 100 46)"/>
      <ellipse cx="100" cy="46" rx="6.5" ry="14" transform="rotate(120 100 46)"/>
    </g>
    <circle cx="100" cy="46" r="7.5" fill="#F5A503"/>
    <circle cx="100" cy="46" r="4" fill="#E07A2E"/>
    <g fill="#F5D547">
      <ellipse cx="62" cy="68" rx="5.5" ry="12"/>
      <ellipse cx="62" cy="68" rx="5.5" ry="12" transform="rotate(60 62 68)"/>
      <ellipse cx="62" cy="68" rx="5.5" ry="12" transform="rotate(120 62 68)"/>
    </g>
    <circle cx="62" cy="68" r="6.5" fill="#E07A2E"/>
    <circle cx="62" cy="68" r="3.2" fill="#C05B40"/>
    <g fill="#FDFDF5">
      <ellipse cx="136" cy="64" rx="5.5" ry="12"/>
      <ellipse cx="136" cy="64" rx="5.5" ry="12" transform="rotate(60 136 64)"/>
      <ellipse cx="136" cy="64" rx="5.5" ry="12" transform="rotate(120 136 64)"/>
    </g>
    <circle cx="136" cy="64" r="6.5" fill="#F5A503"/>
    <circle cx="136" cy="64" r="3.2" fill="#E07A2E"/>
    <path d="M64 150 h72 l-8 34 a8 8 0 0 1 -8 6 h-40 a8 8 0 0 1 -8 -6 z" fill="#4FA3E0"/>
    <rect x="58" y="144" width="84" height="14" rx="7" fill="#3579B5"/>
  </svg>`,

  "chlorophytum-lemon": `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Хлорофитум лимон">
    <g stroke="#7FB531" stroke-width="7" fill="none" stroke-linecap="round">
      <path d="M100 150 C 98 120, 92 92, 78 64"/>
      <path d="M100 150 C 104 118, 112 92, 124 70"/>
      <path d="M96 150 C 82 124, 62 108, 40 102"/>
      <path d="M104 150 C 118 126, 136 112, 158 106"/>
    </g>
    <g stroke="#9BC53D" stroke-width="6" fill="none" stroke-linecap="round">
      <path d="M100 150 C 100 116, 100 88, 100 52"/>
      <path d="M98 150 C 88 116, 72 92, 50 78"/>
      <path d="M102 150 C 112 116, 128 94, 148 82"/>
      <path d="M94 150 C 76 130, 52 122, 30 126"/>
      <path d="M106 150 C 124 132, 146 126, 168 132"/>
    </g>
    <g stroke="#C9E265" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M100 148 C 100 118, 100 92, 100 58"/>
      <path d="M98 148 C 88 118, 74 96, 56 82"/>
      <path d="M102 148 C 112 118, 126 98, 144 86"/>
    </g>
    <path d="M102 148 C 146 122, 174 92, 170 52" stroke="#E3D26E" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g stroke="#9BC53D" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M170 52 C 160 46, 152 44, 142 44"/>
      <path d="M170 52 C 168 42, 168 34, 172 26"/>
      <path d="M170 52 C 178 46, 186 44, 194 46"/>
      <path d="M170 52 C 174 60, 180 66, 188 70"/>
    </g>
    <path d="M64 150 h72 l-8 34 a8 8 0 0 1 -8 6 h-40 a8 8 0 0 1 -8 -6 z" fill="#E2795B"/>
    <rect x="58" y="144" width="84" height="14" rx="7" fill="#C05B40"/>
  </svg>`,
  nephrolepis: `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Нефролепис">
    <g stroke="#1F7A45" stroke-width="14" stroke-dasharray="1 5" stroke-linecap="round" fill="none">
      <path d="M100 150 C 96 118, 84 90, 62 54"/>
      <path d="M100 150 C 104 118, 116 90, 138 54"/>
      <path d="M100 150 C 90 122, 68 102, 38 86"/>
      <path d="M100 150 C 110 122, 132 102, 162 86"/>
      <path d="M100 150 C 96 116, 86 78, 78 34"/>
      <path d="M100 150 C 104 116, 114 78, 122 34"/>
    </g>
    <g stroke="#2E9E52" stroke-width="10" stroke-dasharray="1 4" stroke-linecap="round" fill="none">
      <path d="M100 150 C 98 122, 92 96, 82 62"/>
      <path d="M100 150 C 102 122, 108 96, 118 62"/>
      <path d="M100 150 C 94 126, 80 110, 58 98"/>
      <path d="M100 150 C 106 126, 120 110, 142 98"/>
    </g>
    <g stroke="#57C878" stroke-width="6" stroke-dasharray="1 4" stroke-linecap="round" fill="none">
      <path d="M100 148 C 99 126, 96 106, 92 82"/>
      <path d="M100 148 C 101 126, 104 106, 108 82"/>
    </g>
    <g stroke="#1F7A45" stroke-width="2" fill="none" stroke-linecap="round">
      <path d="M100 150 C 96 118, 84 90, 62 54"/>
      <path d="M100 150 C 104 118, 116 90, 138 54"/>
      <path d="M100 150 C 90 122, 68 102, 38 86"/>
      <path d="M100 150 C 110 122, 132 102, 162 86"/>
      <path d="M100 150 C 96 116, 86 78, 78 34"/>
      <path d="M100 150 C 104 116, 114 78, 122 34"/>
    </g>
    <path d="M64 150 h72 l-8 34 a8 8 0 0 1 -8 6 h-40 a8 8 0 0 1 -8 -6 z" fill="#E2795B"/>
    <rect x="58" y="144" width="84" height="14" rx="7" fill="#C05B40"/>
  </svg>`,

  adenium: `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Адениум Обесум">
    <path d="M78 150 C 70 132, 68 110, 78 92 C 70 78, 74 62, 90 56 C 82 46, 96 36, 108 44 C 122 36, 136 48, 126 60 C 140 68, 138 86, 122 92 C 132 110, 130 132, 122 150 Z" fill="#C9986B"/>
    <path d="M100 150 C 96 130, 96 112, 100 96 M92 130 C 88 116, 88 104, 92 92 M108 130 C 112 116, 112 104, 108 92" stroke="#A97140" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g stroke="#8A5A32" stroke-width="5" fill="none" stroke-linecap="round">
      <path d="M90 56 C 78 44, 68 34, 56 26"/>
      <path d="M108 44 C 116 30, 122 20, 130 12"/>
      <path d="M126 60 C 140 52, 152 46, 164 42"/>
    </g>
    <g fill="#3E8E4F">
      <ellipse cx="52" cy="22" rx="7" ry="14" transform="rotate(-30 52 22)"/>
      <ellipse cx="62" cy="30" rx="7" ry="14" transform="rotate(-52 62 30)"/>
      <ellipse cx="128" cy="8" rx="7" ry="14" transform="rotate(20 128 8)"/>
      <ellipse cx="118" cy="14" rx="7" ry="14" transform="rotate(-4 118 14)"/>
      <ellipse cx="166" cy="38" rx="7" ry="13" transform="rotate(60 166 38)"/>
      <ellipse cx="156" cy="46" rx="7" ry="13" transform="rotate(40 156 46)"/>
    </g>
    <g transform="translate(56 22)">
      <g fill="#D6478C">
        <ellipse cx="0" cy="-14" rx="7" ry="14"/>
        <ellipse cx="0" cy="-14" rx="7" ry="14" transform="rotate(72)"/>
        <ellipse cx="0" cy="-14" rx="7" ry="14" transform="rotate(144)"/>
        <ellipse cx="0" cy="-14" rx="7" ry="14" transform="rotate(216)"/>
        <ellipse cx="0" cy="-14" rx="7" ry="14" transform="rotate(288)"/>
      </g>
      <circle r="5" fill="#FBD7E4"/>
      <circle r="2.5" fill="#B5326A"/>
    </g>
    <g transform="translate(132 10)">
      <g fill="#E85D9C">
        <ellipse cx="0" cy="-12" rx="6" ry="12"/>
        <ellipse cx="0" cy="-12" rx="6" ry="12" transform="rotate(72)"/>
        <ellipse cx="0" cy="-12" rx="6" ry="12" transform="rotate(144)"/>
        <ellipse cx="0" cy="-12" rx="6" ry="12" transform="rotate(216)"/>
        <ellipse cx="0" cy="-12" rx="6" ry="12" transform="rotate(288)"/>
      </g>
      <circle r="4" fill="#FBD7E4"/>
      <circle r="2" fill="#B5326A"/>
    </g>
    <path d="M64 150 h72 l-8 34 a8 8 0 0 1 -8 6 h-40 a8 8 0 0 1 -8 -6 z" fill="#F5C64F"/>
    <rect x="58" y="144" width="84" height="14" rx="7" fill="#DFA92E"/>
  </svg>`,

};

// Иллюстрации питомцев. Ключ — id питомца из данных сервера.
const PET_ART = {

  frodo: `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Сирийский хомяк Фродо">
    <ellipse cx="100" cy="172" rx="76" ry="16" fill="#F1DFC0"/>
    <path d="M34 172 q 12 -12 26 -6 M140 168 q 14 -10 28 2 M60 176 q 10 -8 22 -4" stroke="#E3C89B" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="66" cy="58" r="15" fill="#C98A4B"/>
    <circle cx="66" cy="60" r="8" fill="#8A5A2B"/>
    <circle cx="134" cy="58" r="15" fill="#C98A4B"/>
    <circle cx="134" cy="60" r="8" fill="#8A5A2B"/>
    <path d="M100 48 C 138 48, 156 80, 154 118 C 152 152, 128 166, 100 166 C 72 166, 48 152, 46 118 C 44 80, 62 48, 100 48 Z" fill="#E8A65D"/>
    <path d="M100 118 C 122 118, 134 134, 132 148 C 130 160, 116 166, 100 166 C 84 166, 70 160, 68 148 C 66 134, 78 118, 100 118 Z" fill="#FFF3E0"/>
    <path d="M56 92 C 48 96, 44 104, 44 112 M144 92 C 152 96, 156 104, 156 112" stroke="#C98A4B" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="82" cy="88" r="6" fill="#2A1E14"/>
    <circle cx="118" cy="88" r="6" fill="#2A1E14"/>
    <circle cx="84" cy="86" r="2" fill="#fff"/>
    <circle cx="120" cy="86" r="2" fill="#fff"/>
    <ellipse cx="100" cy="102" rx="5" ry="4" fill="#E8837E"/>
    <path d="M100 106 v6 M100 112 q -6 6 -12 3 M100 112 q 6 6 12 3" stroke="#8A5A2B" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M62 100 h-16 M64 108 l-15 4 M138 100 h16 M136 108 l15 4" stroke="#B98A5E" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="84" cy="140" rx="9" ry="7" fill="#D18A45"/>
    <ellipse cx="116" cy="140" rx="9" ry="7" fill="#D18A45"/>
    <g transform="rotate(14 100 138)">
      <ellipse cx="100" cy="138" rx="7" ry="12" fill="#6B4A2B"/>
      <ellipse cx="100" cy="138" rx="3" ry="8" fill="#8A6236"/>
    </g>
  </svg>`
};
