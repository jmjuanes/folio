import React from "react";

const svg = path => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path fill="currentColor" d={path} />
    </svg>
);

export default {
    POINTER: svg("M4.08048 3.16039C3.78385 3.40903 3.62999 3.82983 3.78355 4.26556L9.46332 20.382C9.78604 21.2977 11.1026 21.2602 11.3757 20.3285L13.2143 14.0574L19.7102 13.3426C20.6753 13.2365 20.9422 11.9467 20.0969 11.469C19.632 11.2062 5.68542 3.32385 5.22053 3.0611C4.81832 2.83378 4.37711 2.91175 4.08048 3.16039ZM6.54963 6.10619C9.21075 7.61021 13.4343 10.0015 16.3964 11.6756L12.3205 12.1154C11.9192 12.1596 11.5719 12.4507 11.4583 12.8381L10.3132 16.7745L6.54963 6.10619Z"),
    UNDO: svg("M7.15625 4C6.9029 3.96381 6.62716 4.02181 6.40625 4.1875L2.40625 7.1875C2.13958 7.3875 2 7.7 2 8C2 8.3 2.13958 8.6125 2.40625 8.8125L6.40625 11.8125C6.62716 11.9782 6.9029 12.0362 7.15625 12C7.4096 11.9638 7.64682 11.8147 7.8125 11.5938C7.97819 11.3728 8.03619 11.0971 8 10.8438C7.96381 10.5904 7.81467 10.3532 7.59375 10.1875L6.03125 9L17 9C17.0731 9 17.246 9.02537 17.4688 9.0625C17.8454 9.12528 18.222 9.236 18.5625 9.40625C19.4849 9.86746 20 10.6428 20 12C20 13.3572 19.4849 14.1325 18.5625 14.5938C18.222 14.764 17.8454 14.8747 17.4688 14.9375C17.246 14.9746 17.0731 15 17 15L4 15C3.44772 15 3 15.4477 3 16C3 16.5523 3.44772 17 4 17L17 17C17.6414 17 18.5237 16.8632 19.4375 16.4062C21.0151 15.6175 22 14.1428 22 12C22 9.85717 21.0151 8.38254 19.4375 7.59375C18.5237 7.13685 17.6414 7 17 7L6.03125 7L7.59375 5.8125C7.81466 5.64681 7.96381 5.4096 8 5.15625C8.03619 4.9029 7.97819 4.62716 7.8125 4.40625C7.64681 4.18534 7.4096 4.03619 7.15625 4Z"),
    REDO: svg("M16.8438 4C17.0971 3.96381 17.3728 4.02181 17.5938 4.1875L21.5938 7.1875C21.8604 7.3875 22 7.7 22 8C22 8.3 21.8604 8.6125 21.5938 8.8125L17.5938 11.8125C17.3728 11.9782 17.0971 12.0362 16.8438 12C16.5904 11.9638 16.3532 11.8147 16.1875 11.5938C16.0218 11.3728 15.9638 11.0971 16 10.8438C16.0362 10.5904 16.1853 10.3532 16.4062 10.1875L17.9688 9L7 9C6.92691 9 6.754 9.02537 6.53125 9.0625C6.15457 9.12528 5.77801 9.236 5.4375 9.40625C4.51508 9.86746 4 10.6428 4 12C4 13.3572 4.51508 14.1325 5.4375 14.5938C5.77801 14.764 6.15457 14.8747 6.53125 14.9375C6.75401 14.9746 6.92691 15 7 15L20 15C20.5523 15 21 15.4477 21 16C21 16.5523 20.5523 17 20 17L7 17C6.35861 17 5.47631 16.8632 4.5625 16.4062C2.98492 15.6175 2 14.1428 2 12C2 9.85717 2.98492 8.38254 4.5625 7.59375C5.47631 7.13685 6.35861 7 7 7L17.9688 7L16.4062 5.8125C16.1853 5.64681 16.0362 5.4096 16 5.15625C15.9638 4.9029 16.0218 4.62716 16.1875 4.40625C16.3532 4.18534 16.5904 4.03619 16.8438 4Z"),

    SQUARE: svg("M7 3C5.29467 3 4.10129 3.79742 3.46875 5.0625C3.1056 5.78881 3 6.48361 3 7C3 8.25 3 15.75 3 17C3 18.7053 3.79742 19.8987 5.0625 20.5312C5.78881 20.8944 6.48361 21 7 21L17 21C18.7053 21 19.8987 20.2026 20.5312 18.9375C20.8944 18.2112 21 17.5164 21 17L21 7C21 6.48361 20.8944 5.78881 20.5312 5.0625C19.8987 3.79742 18.7053 3 17 3L7 3ZM7 5L17 5C17.9197 5 18.4138 5.32758 18.7188 5.9375C18.9181 6.33619 19 6.76639 19 7L19 17C19 17.2336 18.9181 17.6638 18.7188 18.0625C18.4138 18.6724 17.9197 19 17 19L7 19C6.76639 19 6.33619 18.9181 5.9375 18.7188C5.32758 18.4138 5 17.9197 5 17C5 15.75 5 8.25 5 7C5 6.76639 5.0819 6.33619 5.28125 5.9375C5.58621 5.32758 6.08033 5 7 5Z"),
    CIRCLE: svg("M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z"),
    LINE: svg("M19.0625 5C18.8073 4.98037 18.5534 5.07029 18.3438 5.25L4.34375 17.25C4.13409 17.4297 4.01963 17.6823 4 17.9375C3.98037 18.1927 4.07029 18.4466 4.25 18.6562C4.42971 18.8659 4.68233 18.9804 4.9375 19C5.19267 19.0196 5.44659 18.9297 5.65625 18.75L19.6562 6.75C19.8659 6.57029 19.9804 6.31767 20 6.0625C20.0196 5.80733 19.9297 5.55341 19.75 5.34375C19.5703 5.13409 19.3177 5.01963 19.0625 5Z"),
    LINE_HORIZONTAL: svg("M3 11C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13L21 13C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11L3 11Z"),
    TEXT: svg("M7 3C5.73217 3 4.82004 3.60992 4.34375 4.5625C4.07435 5.10131 4 5.60861 4 6L4 7C4 7.55228 4.44772 8 5 8C5.55228 8 6 7.55228 6 7L6 6C6 5.89139 6.05065 5.6487 6.15625 5.4375C6.30496 5.14008 6.51783 5 7 5L11 5L11 19L9 19C8.44772 19 8 19.4477 8 20C8 20.5523 8.44772 21 9 21L15 21C15.5523 21 16 20.5523 16 20C16 19.4477 15.5523 19 15 19L13 19L13 5L17 5C17.4822 5 17.695 5.14008 17.8438 5.4375C17.9493 5.64869 18 5.89139 18 6L18 7C18 7.55228 18.4477 8 19 8C19.5523 8 20 7.55228 20 7L20 6C20 5.60861 19.9257 5.1013 19.6562 4.5625C19.18 3.60992 18.2678 3 17 3L7 3Z"),

    LINE_END_ARROW: svg("M14.9062 6C15.1611 5.97683 15.4129 6.04197 15.625 6.21875L21.625 11.2188C21.8649 11.4186 22 11.7158 22 12C22 12.2842 21.8649 12.5814 21.625 12.7812L15.625 17.7812C15.4129 17.958 15.1611 18.0232 14.9062 18C14.6514 17.9768 14.3955 17.8371 14.2188 17.625C14.042 17.4129 13.9768 17.1611 14 16.9062C14.0232 16.6514 14.1629 16.3955 14.375 16.2188L18.25 13L3 13C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11L18.25 11L14.375 7.78125C14.1629 7.60447 14.0232 7.34862 14 7.09375C13.9768 6.83888 14.042 6.58714 14.2188 6.375C14.3955 6.16286 14.6514 6.02317 14.9062 6Z"),
    LINE_END_CIRCLE: svg("M18 8C20.2091 8 22 9.79086 22 12C22 14.2091 20.2091 16 18 16C16.1435 16 14.6386 14.7149 14.1875 13L3 13C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11L14.1875 11C14.6386 9.28508 16.1435 8 18 8Z"),
    LINE_END_SQUARE: svg("M21 8C22 8 22 9 22 9L22 15C22 15 22 16 21 16L15 16C14 16 14 15 14 15L14 13L3 13C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11L14 11L14 9C14 9 14 8 15 8L21 8Z"),
    LINE_START_ARROW: svg("M9.09375 6C8.83888 5.97683 8.58714 6.04197 8.375 6.21875L2.375 11.2188C2.13512 11.4186 2 11.7158 2 12C2 12.2842 2.13512 12.5814 2.375 12.7812L8.375 17.7812C8.58714 17.958 8.83888 18.0232 9.09375 18C9.34862 17.9768 9.60447 17.8371 9.78125 17.625C9.95803 17.4129 10.0232 17.1611 10 16.9062C9.97683 16.6514 9.83714 16.3955 9.625 16.2188L5.75 13L21 13C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11L5.75 11L9.625 7.78125C9.83714 7.60447 9.97683 7.34862 10 7.09375C10.0232 6.83888 9.95803 6.58714 9.78125 6.375C9.60447 6.16286 9.34862 6.02317 9.09375 6Z"),
    LINE_START_CIRCLE: svg("M6 8C3.79086 8 2 9.79086 2 12C2 14.2091 3.79086 16 6 16C7.85653 16 9.36144 14.7149 9.8125 13L21 13C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11L9.8125 11C9.36144 9.28508 7.85653 8 6 8Z"),
    LINE_START_SQUARE: svg("M3 8C2 8 2 9 2 9L2 15C2 15 2 16 3 16L9 16C10 16 10 15 10 15L10 13L21 13C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11L10 11L10 9C10 9 10 8 9 8L3 8Z"),

    // PALETTE: svg("M6 3C5.60861 3 5.10131 3.07435 4.5625 3.34375C3.60992 3.82004 3 4.73217 3 6L3 18C3 19.2678 3.60992 20.18 4.5625 20.6562C5.10131 20.9257 5.60861 21 6 21L9 21L11.875 21.0312L12.75 21.0625L17.9688 21.0938C19.2405 21.1026 20.1433 20.5159 20.625 19.5625C20.8952 19.0278 20.966 18.5138 20.9688 18.125C20.9714 17.75 21 15.1274 21 15.125C21.0014 14.7271 20.9224 14.1941 20.6562 13.6562C20.1896 12.7131 19.3083 12.113 18.0625 12.0938L19.25 10.0312C20.0116 8.7216 19.7822 7.49163 18.9375 6.5625C18.6652 6.26294 18.3985 6.06024 18.1875 5.9375C17.8633 5.74898 15.9179 4.62602 15.5938 4.4375C15.4821 4.37254 15.3073 4.29548 15.0938 4.21875C14.4328 3.98127 13.7335 3.90214 13.0312 4.15625C12.5352 4.33575 12.1406 4.75724 11.7812 5.21875C11.5699 4.39019 11.1605 3.70524 10.4375 3.34375C9.89869 3.07435 9.39139 3 9 3L6 3ZM6 5C6.375 5 8.625 5 9 5C9.10861 5 9.35131 5.05065 9.5625 5.15625C9.85992 5.30496 10 5.51783 10 6L10 18C10 18.4822 9.85992 18.695 9.5625 18.8438C9.35131 18.9493 9.10861 19 9 19L6 19C5.89139 19 5.6487 18.9493 5.4375 18.8438C5.14008 18.695 5 18.4822 5 18L5 6C5 5.51783 5.14008 5.30496 5.4375 5.15625C5.64869 5.05065 5.89139 5 6 5ZM13.6875 6.03125C13.8841 5.96012 14.1448 5.9998 14.4062 6.09375C14.4961 6.12604 14.5805 6.14854 14.5938 6.15625C14.9179 6.34477 16.8633 7.46773 17.1875 7.65625C17.2359 7.68438 17.352 7.77778 17.4688 7.90625C17.7691 8.23657 17.8129 8.54698 17.5312 9.03125L12.5 17.6875L11.9375 18.6562C11.9375 18.6562 12 18.2684 12 18L12 8.625L13.2188 6.53125C13.3781 6.25722 13.5163 6.09322 13.6875 6.03125ZM16.9062 14.0625L18 14.0938C18.4809 14.0971 18.697 14.2347 18.8438 14.5312C18.9479 14.7417 19.0004 14.9782 19 15.0938C19 15.0919 18.9714 17.7188 18.9688 18.0938C18.968 18.2015 18.9499 18.4462 18.8438 18.6562C18.693 18.9546 18.4522 19.0971 17.9688 19.0938L14 19.0625L16.9062 14.0625ZM7.5 16C7.22386 16 7 16.2239 7 16.5C7 16.7761 7.22386 17 7.5 17C7.77614 17 8 16.7761 8 16.5C8 16.2239 7.77614 16 7.5 16Z"),
    FILL: svg("M9.5625 2.125C8.71521 2.20354 7.90178 2.63309 7.28125 3.25C6.0402 4.48381 5.56618 6.49471 7.09375 8.03125L7.78125 8.71875C6.22993 10.261 4.69323 11.8094 4.25 12.25C3.88379 12.6141 3.47779 13.1991 3.21875 13.9688C2.76755 15.3093 3.01643 16.6969 4.21875 17.9062L7.0625 20.75C8.26481 21.9594 9.65688 22.2558 11 21.8125C11.7711 21.558 12.3525 21.1453 12.7188 20.7812L20.5 13C20.8917 12.6106 20.8894 11.9854 20.5 11.5938L12.0625 3.09375C11.2987 2.32548 10.4098 2.04646 9.5625 2.125ZM9.65625 4.15625C10.0026 4.1057 10.3312 4.20451 10.625 4.5L11.3438 5.21875C11.0778 5.48314 10.0432 6.4929 9.21875 7.3125L8.5 6.625C7.61871 5.73853 8.61724 4.30789 9.65625 4.15625ZM12.75 6.625L18.375 12.3125L16.6875 14L5.46875 14C5.5352 13.9064 5.60103 13.7424 5.65625 13.6875C6.18813 13.1587 8.09786 11.2353 9.90625 9.4375L12.75 6.625ZM20 16C19.6449 16 19.278 16.194 19.0938 16.5625C19.0582 16.6336 19.0136 16.7447 18.9375 16.9062C18.8111 17.1744 18.6812 17.4695 18.5625 17.75C18.4983 17.9018 18.4308 18.044 18.375 18.1875C18.1638 18.7305 18.0214 19.1417 17.9688 19.5C17.9161 19.8583 17.9486 20.1473 18.0938 20.4375C18.403 21.056 19.2074 21.375 20 21.375C20.7926 21.375 21.597 21.056 21.9062 20.4375C22.0514 20.1473 22.0839 19.8583 22.0312 19.5C21.9786 19.1417 21.8362 18.7305 21.625 18.1875C21.5692 18.044 21.5017 17.9018 21.4375 17.75C21.3188 17.4695 21.1889 17.1744 21.0625 16.9062C20.9864 16.7447 20.9418 16.6336 20.9062 16.5625C20.722 16.194 20.3551 16 20 16Z"),
    CORNERS: svg("M7 3C6.57259 3 6.18234 3.05769 5.8125 3.15625C4.72164 3.44696 3.93198 4.13604 3.46875 5.0625C3.1056 5.78881 3 6.48361 3 7L3 10C3 10.5523 3.44772 11 4 11C4.55228 11 5 10.5523 5 10L5 7C5 6.76639 5.0819 6.3362 5.28125 5.9375C5.50133 5.49734 5.81029 5.22759 6.3125 5.09375C6.5103 5.04104 6.74266 5 7 5L10 5C10.5523 5 11 4.55228 11 4C11 3.44772 10.5523 3 10 3L7 3ZM14 3C13.4477 3 13 3.44772 13 4C13 4.55228 13.4477 5 14 5L17 5C17.2336 5 17.6638 5.0819 18.0625 5.28125C18.6724 5.58621 19 6.08033 19 7L19 10C19 10.5523 19.4477 11 20 11C20.5523 11 21 10.5523 21 10L21 7C21 5.29467 20.2026 4.10129 18.9375 3.46875C18.2112 3.1056 17.5164 3 17 3L14 3ZM4 13C3.44772 13 3 13.4477 3 14L3 17C3 18.7053 3.79742 19.8987 5.0625 20.5312C5.78881 20.8944 6.48361 21 7 21L10 21C10.5523 21 11 20.5523 11 20C11 19.4477 10.5523 19 10 19L7 19C6.76639 19 6.3362 18.9181 5.9375 18.7188C5.32758 18.4138 5 17.9197 5 17L5 14C5 13.4477 4.55228 13 4 13ZM20 13C19.4477 13 19 13.4477 19 14L19 17C19 17.9197 18.6724 18.4138 18.0625 18.7188C17.6638 18.9181 17.2336 19 17 19L14 19C13.4477 19 13 19.4477 13 20C13 20.5523 13.4477 21 14 21L17 21C17.5164 21 18.2112 20.8944 18.9375 20.5312C20.2026 19.8987 21 18.7053 21 17L21 14C21 13.4477 20.5523 13 20 13Z"),
    OBJECT_GROUP: svg("M5 3C4.60861 3 4.1013 3.07435 3.5625 3.34375C2.60992 3.82004 2 4.73217 2 6L2 7C2 7.55228 2.44772 8 3 8C3.55228 8 4 7.55228 4 7L4 6C4 5.51783 4.14008 5.30496 4.4375 5.15625C4.64869 5.05065 4.89139 5 5 5L6 5C6.55228 5 7 4.55228 7 4C7 3.44772 6.55228 3 6 3L5 3ZM18 3C17.4477 3 17 3.44772 17 4C17 4.55228 17.4477 5 18 5L19 5C19.1086 5 19.3513 5.05065 19.5625 5.15625C19.8599 5.30496 20 5.51783 20 6L20 7C20 7.55228 20.4477 8 21 8C21.5523 8 22 7.55228 22 7L22 6C22 4.73217 21.3901 3.82004 20.4375 3.34375C19.8987 3.07435 19.3914 3 19 3L18 3ZM8 7C7.73361 7 7.4138 7.0431 7.0625 7.21875C6.42242 7.53879 6 8.16967 6 9C6 9.375 6 11.625 6 12C6 12.8303 6.42242 13.4612 7.0625 13.7812C7.41381 13.9569 7.73361 14 8 14L9 14L9 15C9 15.2664 9.0431 15.5862 9.21875 15.9375C9.53879 16.5776 10.1697 17 11 17L16 17C16.8303 17 17.4612 16.5776 17.7812 15.9375C17.9569 15.5862 18 15.2664 18 15L18 12C18 11.7336 17.9569 11.4138 17.7812 11.0625C17.4612 10.4224 16.8303 10 16 10L15 10L15 9C15 8.73361 14.9569 8.41381 14.7812 8.0625C14.4612 7.42242 13.8303 7 13 7L8 7ZM8 9L13 9L13 12L8 12C8 11.625 8 9.375 8 9ZM15 12L16 12L16 15L11 15L11 14L13 14C13.2664 14 13.5862 13.9569 13.9375 13.7812C14.5776 13.4612 15 12.8303 15 12ZM3 16C2.44772 16 2 16.4477 2 17L2 18C2 18.3914 2.07435 18.8987 2.34375 19.4375C2.82004 20.3901 3.73217 21 5 21L6 21C6.55228 21 7 20.5523 7 20C7 19.4477 6.55228 19 6 19L5 19C4.51783 19 4.30496 18.8599 4.15625 18.5625C4.05065 18.3513 4 18.1086 4 18L4 17C4 16.4477 3.55228 16 3 16ZM21 16C20.4477 16 20 16.4477 20 17L20 18C20 18.1086 19.9493 18.3513 19.8438 18.5625C19.695 18.8599 19.4822 19 19 19L18 19C17.4477 19 17 19.4477 17 20C17 20.5523 17.4477 21 18 21L19 21C20.2678 21 21.18 20.3901 21.6562 19.4375C21.9257 18.8987 22 18.3914 22 18L22 17C22 16.4477 21.5523 16 21 16Z"),
    OBJECT_UNGROUP: svg("M5 5C4.73361 5 4.4138 5.0431 4.0625 5.21875C3.42242 5.53879 3 6.16967 3 7C3 7.375 3 9.625 3 10C3 10.8303 3.42242 11.4612 4.0625 11.7812C4.41381 11.9569 4.73361 12 5 12L10 12C10.2664 12 10.5862 11.9569 10.9375 11.7812C11.5776 11.4612 12 10.8303 12 10L12 7C12 6.73361 11.9569 6.4138 11.7812 6.0625C11.4612 5.42242 10.8303 5 10 5L5 5ZM5 7L10 7L10 10L5 10C5 9.625 5 7.375 5 7ZM14 13C13.7336 13 13.4138 13.0431 13.0625 13.2188C12.4224 13.5388 12 14.1697 12 15L12 18C12 18.2664 12.0431 18.5862 12.2188 18.9375C12.5388 19.5776 13.1697 20 14 20L19 20C19.8303 20 20.4612 19.5776 20.7812 18.9375C20.9569 18.5862 21 18.2664 21 18L21 15C21 14.7336 20.9569 14.4138 20.7812 14.0625C20.4612 13.4224 19.8303 13 19 13L14 13ZM14 15L19 15L19 18L14 18L14 15Z"),

    TEXT_LEFT: svg("M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7L20 7C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5L4 5ZM4 9C3.44772 9 3 9.44772 3 10C3 10.5523 3.44772 11 4 11L12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9L4 9ZM4 13C3.44772 13 3 13.4477 3 14C3 14.5523 3.44772 15 4 15L20 15C20.5523 15 21 14.5523 21 14C21 13.4477 20.5523 13 20 13L4 13ZM4 17C3.44772 17 3 17.4477 3 18C3 18.5523 3.44772 19 4 19L12 19C12.5523 19 13 18.5523 13 18C13 17.4477 12.5523 17 12 17L4 17Z"),
    TEXT_RIGHT: svg("M20 5C20.5523 5 21 5.44772 21 6C21 6.55228 20.5523 7 20 7L4 7C3.44772 7 3 6.55228 3 6C3 5.44772 3.44772 5 4 5L20 5ZM20 9C20.5523 9 21 9.44772 21 10C21 10.5523 20.5523 11 20 11L12 11C11.4477 11 11 10.5523 11 10C11 9.44772 11.4477 9 12 9L20 9ZM20 13C20.5523 13 21 13.4477 21 14C21 14.5523 20.5523 15 20 15L4 15C3.44772 15 3 14.5523 3 14C3 13.4477 3.44772 13 4 13L20 13ZM20 17C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19L12 19C11.4477 19 11 18.5523 11 18C11 17.4477 11.4477 17 12 17L20 17Z"),
    TEXT_CENTER: svg("M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7L20 7C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5L4 5ZM8 9C7.44772 9 7 9.44772 7 10C7 10.5523 7.44772 11 8 11L16 11C16.5523 11 17 10.5523 17 10C17 9.44772 16.5523 9 16 9L8 9ZM4 13C3.44772 13 3 13.4477 3 14C3 14.5523 3.44772 15 4 15L20 15C20.5523 15 21 14.5523 21 14C21 13.4477 20.5523 13 20 13L4 13ZM8 17C7.44772 17 7 17.4477 7 18C7 18.5523 7.44772 19 8 19L16 19C16.5523 19 17 18.5523 17 18C17 17.4477 16.5523 17 16 17L8 17Z"),

    TRASH: svg("M9 2C8.62123 2 8.26314 2.22372 8.09375 2.5625L6.875 5L4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7L5 7L5 18C5 18.5164 5.1056 19.2112 5.46875 19.9375C6.10129 21.2026 7.29467 22 9 22L15 22C16.7053 22 17.8987 21.2026 18.5312 19.9375C18.8944 19.2112 19 18.5164 19 18L19 7L20 7C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5L17.125 5L15.9062 2.5625C15.7369 2.22372 15.3788 2 15 2L9 2ZM9.625 4L14.375 4L14.875 5L9.125 5L9.625 4ZM7 7L17 7L17 18C17 18.2336 16.9181 18.6638 16.7188 19.0625C16.4138 19.6724 15.9197 20 15 20L9 20C8.08033 20 7.58621 19.6724 7.28125 19.0625C7.0819 18.6638 7 18.2336 7 18L7 7ZM10 9C9.44772 9 9 9.44772 9 10L9 17C9 17.5523 9.44772 18 10 18C10.5523 18 11 17.5523 11 17L11 10C11 9.44772 10.5523 9 10 9ZM14 9C13.4477 9 13 9.44772 13 10L13 17C13 17.5523 13.4477 18 14 18C14.5523 18 15 17.5523 15 17L15 10C15 9.44772 14.5523 9 14 9Z"),
    CAMERA: svg("M10 4C9.19165 4 8.75654 4.30595 7.78125 5.28125C7.25654 5.80596 7.02499 6 7 6L5 6C3.73217 6 2.82004 6.60992 2.34375 7.5625C2.07435 8.10131 2 8.60861 2 9C2 9.875 2 15.125 2 16C2 16.5164 2.1056 17.2112 2.46875 17.9375C3.10129 19.2026 4.29467 20 6 20L18 20C19.7053 20 20.8987 19.2026 21.5312 17.9375C21.8944 17.2112 22 16.5164 22 16L22 9C22 8.60861 21.9257 8.10131 21.6562 7.5625C21.18 6.60992 20.2678 6 19 6L17 6C16.975 6 16.7435 5.80595 16.2188 5.28125C15.2435 4.30596 14.8083 4 14 4L10 4ZM10 6L14 6C14.025 6 14.2565 6.19405 14.7812 6.71875C15.7565 7.69404 16.1917 8 17 8L19 8C19.4822 8 19.695 8.14008 19.8438 8.4375C19.9493 8.64869 20 8.89139 20 9L20 16C20 16.2336 19.9181 16.6638 19.7188 17.0625C19.4138 17.6724 18.9197 18 18 18L6 18C5.08033 18 4.58621 17.6724 4.28125 17.0625C4.0819 16.6638 4 16.2336 4 16C4 15.125 4 9.875 4 9C4 8.89139 4.05065 8.64869 4.15625 8.4375C4.30496 8.14008 4.51783 8 5 8L7 8C7.80835 8 8.24346 7.69405 9.21875 6.71875C9.74346 6.19404 9.97501 6 10 6ZM12 9C10.067 9 8.5 10.567 8.5 12.5C8.5 14.433 10.067 16 12 16C13.933 16 15.5 14.433 15.5 12.5C15.5 10.567 13.933 9 12 9ZM12 11C12.8284 11 13.5 11.6716 13.5 12.5C13.5 13.3284 12.8284 14 12 14C11.1716 14 10.5 13.3284 10.5 12.5C10.5 11.6716 11.1716 11 12 11Z"),
};