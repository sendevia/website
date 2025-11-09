<template>
  <div class="notfound">
    <div id="notfound-information">
      <h1>(⊙x⊙;)</h1>
      <div>
        <h3>你的网页遇到问题，不需要刷新。</h3>
        <h3>我们不收集任何信息，你只需 <a href="/">返回本站首页</a>。</h3>
      </div>
      <h4>1000% 完成</h4>
    </div>
    <div id="notfound-qrcode">
      <span></span>
      <div>
        <p>所访问页面不存在或已失效，请检查链接是否正确。</p>
        <p>终止代码：404_NOT_FOUND</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "sass:meta";

.notfound {
  display: flex;
  flex-direction: column;
  gap: 24px;
  grid-column: span 12;
  justify-content: space-evenly;

  height: 100%;

  padding: 5vw;

  color: var(--md-sys-color-on-error-container);

  #notfound-information {
    display: flex;
    flex-direction: column;
    gap: 12px;

    margin-inline-start: 5px;

    h1 {
      margin: 6vh 0px;

      font-size: 100rem;
      line-height: 100rem;
    }

    h3 {
      font-size: 25rem;

      a {
        text-decoration: underline;
      }
    }
  }

  #notfound-qrcode {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: flex-start;

    margin-inline-start: 5px;

    span {
      height: 120px;
      width: 120px;

      border-radius: var(--md-sys-shape-corner-medium);
      outline: 2px solid var(--md-sys-color-outline);

      background-image: var(--via-svg-qrcode-rickroll);
      background-repeat: no-repeat;
    }
  }
}

@media screen and (max-width: 1600px) {
  .notfound {
    grid-column: span 12;
  }
}

@media screen and (max-width: 1200px) {
  .notfound {
    grid-column: span 8;
  }
}

@media screen and (max-width: 840px) {
  .notfound {
    grid-column: span 6;

    #notfound-information {
      h1 {
        font-size: 75rem;
      }
      h3 {
        font-size: 20rem;
      }
    }
  }
}

@media screen and (max-width: 600px) {
  .notfound {
    grid-column: span 4;
  }
}
</style>
