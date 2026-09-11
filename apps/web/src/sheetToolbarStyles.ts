export const SHEET_TOOLBAR_STYLES = String.raw`
.sheet-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.sheet-toolbar-divider {
  width: 1px;
  height: 24px;
  margin: 0 2px;
  background: #c9b8a3;
}

.sheet-action-button {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid #9f7752;
  border-radius: 999px;
  background: #dec6a6;
  color: #302219;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .5), 0 1px 3px rgba(62, 42, 26, .16);
  cursor: pointer;
  font: inherit;
}

.sheet-action-button:hover:not(:disabled),
.sheet-action-button:focus-visible {
  border-color: #755438;
  background: #cfa97e;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .45), 0 2px 7px rgba(62, 42, 26, .22);
}

.sheet-action-button:active:not(:disabled) {
  background: #bd9367;
  box-shadow: inset 0 1px 3px rgba(62, 42, 26, .24);
  transform: translateY(1px);
}

.sheet-action-button:focus-visible {
  outline: 3px solid rgba(117, 84, 56, .3);
  outline-offset: 2px;
}

.sheet-action-icon {
  display: block;
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sheet-action-status {
  min-width: 9rem;
  color: #65594d;
  font-size: .74rem;
  text-align: right;
}

@media (max-width: 760px) {
  .sheet-toolbar { justify-content: flex-start; }
  .sheet-action-status { flex-basis: 100%; text-align: left; }
}
`;
