import { TransitionGroup } from "vue";
import type {
  SearchHighlightListBase,
  WordSplitType
} from "./SearchHighlightList";
import style from "./SearchHighlightList.module.scss";

const elementBuilder = (
  resource: WordSplitType,
  itemIdx: number,
  selectedIdx: number
): JSX.Element => {
  const { data, record, keyword } = resource;
  // build title-element
  let title: JSX.Element;
  switch (true) {
    case record.titleStartIdx === 0:
      title = (
        <h3>
          <span class={[style["highlight"]]}>
            {data.title.substring(0, keyword.length)}
          </span>
          {data.title.substring(keyword.length)}
        </h3>
      );
      break;
    case record.titleStartIdx > 0:
      title = (
        <h3>
          {data.title.substring(0, record.titleStartIdx)}
          <span class={style["highlight"]}>
            {data.title.substring(
              record.titleStartIdx,
              record.titleStartIdx + keyword.length
            )}
          </span>
          {data.title.substring(record.titleStartIdx + keyword.length)}
        </h3>
      );
      break;
    default:
      title = <h3>{data.title}</h3>;
      break;
  }

  // build text-content-element
  let text: JSX.Element;
  switch (true) {
    case record.textStartIdx === 0:
      text = (
        <h5>
          <span class={[style["highlight"]]}>
            {data.text.substring(0, keyword.length)}
          </span>
          {data.text.substring(keyword.length)}
        </h5>
      );
      break;
    case record.textStartIdx > 0:
      text = (
        <h5>
          {data.text.substring(0, record.textStartIdx)}
          <span class={style["highlight"]}>
            {data.text.substring(
              record.textStartIdx,
              record.textStartIdx + keyword.length
            )}
          </span>
          {data.text.substring(record.textStartIdx + keyword.length)}
        </h5>
      );
      break;
    default:
      text = <h5>{data.text}</h5>;
      break;
  }

  return (
    <li
      key={resource.data.id}
      class={[itemIdx === selectedIdx ? style["item-select"] : null]}
    >
      {title}
      {text}
    </li>
  );
};

const ListTemplateRender = (that: SearchHighlightListBase): JSX.Element => (
  <div class={[style["highlightL-list-wrapper"]]}>
    <main class={[style["main-wrapper"]]}>
      <header>
        <input ref="input" type="text" class={["st-input"]} />
        <span
          style={{
            fontWeight: "bold",
            marginLeft: "5px"
          }}
          v-show={that.searchLoading}
          class={["color-text"]}
        >
          Loading...
        </span>
      </header>

      <div class={[style["list-wrapper"]]}>
        <h2
          v-show={that.displayList.length === 0 && !that.searchLoading}
          class={["color-text"]}
        >
          当前列表为空...
        </h2>

        <TransitionGroup name="list" tag="ul">
          {that.displayList.map((value, index) =>
            elementBuilder(value, index, that.selectedIndex)
          )}
        </TransitionGroup>
      </div>
    </main>
  </div>
);

export { ListTemplateRender };
