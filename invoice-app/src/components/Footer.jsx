import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faFileAlt, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";

const Footer = styled.footer`
  padding: 1rem 0;
  font-family: "Poppins", sans-serif;
  color: #00bfff;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
`;

const HeartIcon = styled(FontAwesomeIcon)`
  color: #ff69b4;
  margin: 0 0.25rem;
`;

const StyledNavLink = styled.a`
  color: #00bfff;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ffffff;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const CreditText = styled.div`
  font-size: 0.9rem;
  display: flex;
  align-items: center;
`;

const FooterComponent = () => {
  return (
    <Footer className="footer" >
      <CreditText>
        Made with <HeartIcon icon={faHeart} /> by Nahfid Nissar
      </CreditText>
      <StyledNavLink
        href="https://mega.nz/file/yuRSgLgS#AutwszU8CuCAfyzCVekzD_5byfSr6Tnn2upx-5aCqeg"
        title="Resume"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon icon={faFileAlt} />
      </StyledNavLink>

      <StyledNavLink
        href="https://github.com/NafiGit"
        title="GitHub"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon icon={faGithub} />
      </StyledNavLink>
    </Footer>
  );
};

export default FooterComponent;
